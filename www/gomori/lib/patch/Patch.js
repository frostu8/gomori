const fs = require('fs');
const { expand } = require('../pathutils');

/**
 * A patch. All patches implement this class.
 */
class Patch {
    /**
     * Create a new patch.
     *
     * @param {string} path - The path of the resulting patch, relative to the
     * `WWW_DIR`.
     * @param {Buffer} data - The data to patch in.
     * @param {string} modId - The mod responsible for this patch.
     */
    constructor(path, data, modId) {
        this.path = path;
        this.data = data;
        this.modId = modId;
    }

    /**
     * Create a `.BASIL` file at the location of the patch.
     *
     * @returns {string|null} - The path to the newly created `.BASIL` file, if 
     * one was created.
     */
    createUnpatch() {
        const path = expand(this.path);
        const basilPath = expand(this.basilPath);

        // if it exists, copy the old file into a `.BASIL` file.
        if (fs.existsSync(path)) {
            fs.copyFileSync(path, basilPath);

            return this.basilPath;
        } else {
            return null;
        }
    }

    /**
     * Attempt to write the patch to the file system. The default 
     * implementation simply copies the files into the patch destination, and
     * deallocates the buffer.
     *
     * @param {Crypto} crypto - Functions for encryption and decryption.
     */
    patch(crypto) {
        const path = expand(this.path);

        fs.writeFileSync(path, this.data);

        // cut data for GC
        this.data = null;
    }

    /**
     * Preforms any post-patch actions, like registering plugins.
     *
     * @param {ModLoader} modLoader - The global `ModLoader`.
     */
    postPatch(modLoader) {}

    /**
     * Checks if a patch conflicts with another.
     *
     * @param {Patch} other - The patch to check conflicts with.
     *
     * @returns {bool} - If the patches conflict.
     */
    conflicts(other) {
        return other.path === this.path;
    }

    /**
     * Attempt to resolve conflicting patches. If the patch could not be
     * resolved, this should return null.
     *
     * @param {Patch} patches - All the conflicting patches. All patches will
     * be of the same class; the class that implements this function.
     * 
     * @returns {Patch|null} - The resulting patch.
     */
    static resolve(patches) {
        return null;
    }

    /**
     * The `.BASIL` unpatch file's projected location.
     */
    get basilPath() {
        return this.path !== null ? this.path + '.BASIL' : null;
    }
}

module.exports = Patch;
