const { ZipModFs, DirModFs } = require('./modfs');
const ModFile = require('./ModFile');

const ospath = require('path/posix');
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

    build() {
        this.buildJs();
    }

    /**
     * Build all plugin files.
     */
    buildJs() {
        const jsFiles = this.meta.files?.plugins;

        if (jsFiles) {
            for (let path of jsFiles) {
                const dir = this.modFs.listDir(path);

                if (dir) {
                    // this is a directory
                    this.jsFiles = dir.map(file => {
                        return this.buildSingleFile(
                            ospath.join(path, file),
                            utils.replaceExt(ospath.join(PLUGINS_DIR, file), '.OMORI')
                        );
                    });
                } else {
                    // this is a single file
                    this.jsFiles.push(this.buildSingleFile(
                        path, 
                        utils.replaceExt(ospath.join(PLUGINS_DIR, ospath.basename(path)), '.OMORI')
                    ));
                }
            }
        }
    }

    buildSingleFile(modPath, patchPath) {
        const modFile = new ModFile(modPath, patchPath);

        modFile.build(this.modFs);

        return modFile;
    }

    patch() {
        // patch js files
        this.jsFiles.forEach(file => {
            file.patch(this.modLoader.crypto);

            this.modLoader.plugins.push(this._genPluginMeta(file));
        });
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
