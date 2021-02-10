const { PROTECTED_FILES } = require('../constants/filetypes');

const fs = require('fs');
const ospath = require('path/posix');

/**
 * A `ModFile` is responsible for tracking changes in the game path. A 
 * `ModFile` is best suited for full patches of single files. If you wish to do
 * delta patching, see `ModDeltaFile`.
 *
 * A BASIL file is the original, unmodified version of the patch.
 */
class ModFile {
    constructor(modPath, patchPath) {
        // The decrypted file stored in a mod.
        this.modPath = modPath;
        // The encrypted file stored in the game directory.
        this.patchPath = patchPath;

        // The decrypted buffer of data stored in-between the `build` and
        // `patch` phases of mods.
        this.data = Buffer.alloc(0);
    }

    build(modfs) {
        // if this patches a protected file, throw
        if (PROTECTED_FILES.includes(this.patchPath))
            throw new Error(`Cannot patch protected file ${this.patchPath}`);

        // read the file from the mod file system
        const file = modfs.getFile(this.modPath);

        if (!file) 
            throw new Error(`Failed to read file ${this.modPath} from mod!`);

        this.data = file;
    }

    patch(crypto) {
        // attempt to encrypt
        // TODO: proper encryption
        const encryptedData = crypto.steamEncrypt(this.data);

        // save a basil copy if this file already exists
        if (fs.existsSync(this.patchPath))
            fs.copyFileSync(this.patchPath, this.basilPath);

        // patch over file
        fs.writeFileSync(this.patchPath, encryptedData);

        // deallocate data to free up memory
        this.data = Buffer.alloc(0);
    }

    get basilPath() {
        return this.patchPath !== null ? `${this.patchPath}.BASIL` : null;
    }

    get basename() {
        return ospath.basename(this.patchPath).slice(0, -ospath.extname(this.patchPath).length);
    }
}

module.exports = ModFile;
