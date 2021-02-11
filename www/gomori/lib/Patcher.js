const PluginPatch = require('./patch/PluginPatch');

/**
 * A mod-local `PatchManager` with helper functions for mods.
 */
class Patcher {
    constructor(modId) {
        this._modId = modId;
        this.patches = [];
    }

    /**
     * Write a plugin patch.
     *
     * @param {string} path - The path of the plugin to patch, relative to the
     * `js/plugins` directory.
     * @param {Buffer} data - The data to use for the patch.
     */
    patchPlugin(path, data) {
        this.patches.push(new PluginPatch(path, data, this._modId));
    }
}

module.exports = Patcher;
