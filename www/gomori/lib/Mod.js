const ZipModFs = require('./modfs/ZipModFs');
const DirModFs = require('./modfs/DirModFs');
const ModFile = require('./ModFile');

const pathop = require('path/posix');
const posix = require('path/posix');
const utils = require('./utils');

// storage constants
const PLUGINS_DIR = 'www/js/plugins';

class Mod {
    constructor(modLoader, id) {
        // The parent modloader
        this.modLoader = modLoader;
        // The id of this mod
        this.id = id;
        // Metadata of this mod
        this.meta = null;

        // The ModFs used to access this mod's files
        this.modFs = null;

        // Plugin files to be patched
        this.jsFiles = [];
    }

    // file loading functions
    openFs(path) {
        this.modFs = new DirModFs(path);
    }

    openZip(path) {
        this.modFs = new ZipModFs(path, this.id);
    }

    // mod functions
    load() {
        const buf = this.modFs.getFile('mod.json');

        if (buf) {
            this.meta = JSON.parse(buf.toString());
            return this.meta;
        } else {
            throw new Error('mod.json was not found!');
        }
    }

    build(patcher) {
        this.buildPlugins(patcher);
    }

    /**
     * Build all plugin files.
     */
    buildPlugins(patcher) {
        const jsFiles = this.meta.files?.plugins;

        if (jsFiles) {
            for (const path of jsFiles) {
                const dir = this.modFs.listDir(path);

                if (dir) {
                    // this is a directory
                    dir.forEach(file => patcher.patchPlugin(
                        file, this.modFs.getFile(posix.join(path, file))));
                } else {
                    // this is a single file
                    patcher.patchPlugin(
                        pathop.basename(path), this.modFs.getFile(path));
                }
            }
        }
    }

    // IMPLEMENT MORE THINGS
    // ...
    // ...things
    // ...
    
    _genPluginMeta(file) {
        return {
            name: file.basename,
            status: true,
            description: `Patched by GOMORI | Plugin file for ${this.id}`,
            parameters: {}
        }
    }
}

module.exports = Mod;
