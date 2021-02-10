/**
 * @typedef {Object} FileEncryption
 *
 * @property {string} encrypted - The file extension of encrypted variants of 
 * this file type. When defined, enables encryption when building.
 *
 * @property {string} decrypted - The file extension of decrypted variants of 
 * this file type.
 *
 * @property {function} encrypt - A function to call when encrypting this kind
 * of file. This is binded to an instance of `Crypto` when run.
 *
 * @property {function} decrypt - A function to call when decrypting this kind
 * of file. This is binded to an instance of `Crypto` when run.
 */

const crypto = require('crypto');
const fs = require('fs');
const ospath = require('path/posix');

const ALGORITHM = "aes-256-ctr";

/**
 * Stores the encryption keys used to encrypt and decrypt game files.
 */
class Crypto {
    constructor(Decrypter) {
        this.steamKey = String(window.nw.App.argv).slice(2);
        this.rpgmvKey = this._getAssetKey();
        this.rpgmvHeader = this._getAssetHeader(Decrypter);
    }

    _getAssetKey() {
        const encryptSys = fs.readFileSync('www/data/System.KEL');
        const sys = JSON.parse(this.steamDecrypt(encryptSys).toString());

        return parseBase64(sys.encryptionKey);
    }

    _getAssetHeader(Decrypter) {
        // RPGMV really loves to be a thorn in the bottom.
        const { SIGNATURE: sig, VER: ver, REMAIN: rem} = Decrypter;
        const hexHeader = sig + ver + rem;

        return parseBase64(hexHeader);
    }

    /**
     * Preforms a decryption on a FULL FILE with the steam key.
     *
     * @param {Buffer} buffer - The source buffer.
     * @returns {Buffer}
     */
    steamDecrypt(buffer) {
        // get initialization vectors
        const iv = buffer.slice(0, 16);

        buffer = buffer.slice(16);

        // create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, this.steamKey, iv);

        return Buffer.concat([decipher.update(buffer), decipher.final()]);
    }

    /**
     * Preforms an encryption on a FULL FILE with the steam key.
     *
     * @param {Buffer} buffer - The source buffer.
     * @returns {Buffer}
     */
    steamEncrypt(buffer) {
        // get new initialization vectors
        const iv = crypto.randomBytes(16);

        // create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, this.steamKey, iv);
        
        return Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    }

    /**
     * Preforms an encryption on a FULL FILE with the rpgmv key.
     *
     * @param {Buffer} buffer - The source buffer.
     * @returns {Buffer}
     */
    assetDecrypt(buffer) {
        // drop the header, we do need no stinkin' security!
        buffer = buffer.slice(16);

        // XOR decrypt and encrypt
        for (let i = 0; i < 16; i++) {
            buffer[i] = buffer[i] ^ this.rpgmvKey[i];
        }

        return buffer;
    }

    /**
     * Preforms a decryption on a FULL FILE with the rpgmv key.
     *
     * @param {Buffer} buffer - The source buffer.
     * @returns {Buffer}
     */
    assetEncrypt(buffer) {
        // XOR decrypt and encrypt
        for (let i = 0; i < 16; i++) {
            buffer[i] = buffer[i] ^ this.rpgmvKey[i];
        }

        // re-add header
        return Buffer.concat([this.rpgmvHeader, buffer]);
    }
}

function parseBase64(str) {
    return Buffer.from(str
        .match(/.{2}/g)
        .map(hex => parseInt(hex, 16)));
}

/**
 * File encryption schemes.
 * @type {FileEncryption[]}
 */
const FILE_ENCRYPTION_SCHEMES = [
    { 
        encrypted: "OMORI", 
        decrypted: "js", 
        encrypt: Crypto.prototype.steamEncrypt, 
        decrypt: Crypto.prototype.steamDecrypt
    },
    { 
        encrypted: "HERO", 
        decrypted: "yaml", 
        encrypt: Crypto.prototype.steamEncrypt, 
        decrypt: Crypto.prototype.steamDecrypt
    },
    { 
        encrypted: "KEL", 
        decrypted: "json", 
        encrypt: Crypto.prototype.steamEncrypt, 
        decrypt: Crypto.prototype.steamDecrypt
    },
    { 
        encrypted: "AUBREY", 
        decrypted: "json", 
        encrypt: Crypto.prototype.steamEncrypt, 
        decrypt: Crypto.prototype.steamDecrypt
    },
    { 
        encrypted: "PLUTO", 
        decrypted: "yaml", 
        encrypt: Crypto.prototype.steamEncrypt, 
        decrypt: Crypto.prototype.steamDecrypt
    },
    {
        encrypted: "rpgmvp",
        decrypted: "png",
        encrypt: Crypto.prototype.assetEncrypt,
        decrypt: Crypto.prototype.assetDecrypt,
    },
    {
        encrypted: "rpgmvo",
        decrypted: "ogg",
        encrypt: Crypto.prototype.assetEncrypt,
        decrypt: Crypto.prototype.assetDecrypt,
    }
]

module.exports = Crypto;
