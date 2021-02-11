const Patch = require('./Patch');

const pathop = require('path');

/**
 * A patch over a Steam-encrypted file.
 */
class SteamPatch extends Patch {
    constructor(path, data, modId, encryptExt) {
        super(path, data, modId);

        // map out path
        this.path = `${path.slice(0, -pathop.extname(path).length)}.${encryptExt}`;
    }

    patch(crypto) {
        // use steam encryption
        this.data = crypto.steamEncrypt(this.data);

        return super.patch(crypto);
    }
}

module.exports = SteamPatch;
