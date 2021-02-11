const Patcher = require('./Patcher');

/**
 * A class that manages patches made by mods.
 */
class PatchManager {
    constructor() {
        this.pending = [];
    }

    /**
     * Create a patcher.
     *
     * @param {string} modId - The modId to create a patcher for.
     */
    patcher(modId) {
        return new Patcher(modId);
    }

    /**
     * Apply a patcher to the `PatchManager`.
     *
     * @param {Patcher} patcher - The patcher to apply.
     */
    applyPatcher(patcher) {
        this.pending = this.pending.concat(patcher.patches);
    }

    /**
     * Apply all pending patches to the file system.
     */
    patch(modLoader) {
        this.pending.forEach(patch => {
            // create unpatch
            patch.createUnpatch();
            // patch
            patch.patch(modLoader.crypto);
            // post patch
            patch.postPatch(modLoader);
        });
    }
}

module.exports = PatchManager;
