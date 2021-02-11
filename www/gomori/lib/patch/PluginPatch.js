const SteamPatch = require('./SteamPatch');

const pathop = require('path');

/**
 * A patch over a `.js` plugin file.
 */
class PluginPatch extends SteamPatch {
    constructor(path, data, modId) {
        super(path, data, modId);

        if (pathop.extname(path) !== '.js') 
            throw new Error(`Cannot patch non-plugin file ${path}!`);

        // get plugin basename
        this.basename = path.slice(0, -3);

        // because plugins can only be accesssed in a single directory,
        // automatically route all plugin patches to the plugin directory.
        this.path = pathop.join('js/plugins', this.path);
    }

    postPatch(modLoader) {
        // register plugin only if it doesn't already exist
        if (!modLoader.plugins.some(plugin => plugin.name === this.basename))
            modLoader.plugins.push(this._genPluginMeta());
    }

    _genPluginMeta() {
        return {
            name: this.basename,
            status: true,
            description: `Patched by GOMORI | Plugin file for ${this.modId}`,
            parameters: {}
        };
    }
}

module.exports = PluginPatch;
