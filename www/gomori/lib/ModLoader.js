const Mod = require("./Mod");
const PatchManager = require('./PatchManager');
const Crypto = require('./Crypto');
const { defaultConfig } = require("../constants/defaults");
const { exists, read, write, readDir } = require("../utils/fs");
const { decryptBuffer } = require("../utils/encryption");

const fs = require("fs");
const path = require("path/posix");

/**
 * The GOMORI `ModLoader`.
 *
 * The `ModLoader` class is the supervisor of all modding activity done in
 * GOMORI. It is not only responsible for loading mods, but also providing
 * utilities to mods.
 *
 * # Staging
 * Mod patching is done in a set of stages.
 *
 * ## `load` stage
 * The load stage is responsible for loading mods and their metadata before
 * preforming interactions on them to ensure that each mod can access every
 * other mod.
 *
 * ## `build` stage
 * The build stage is responsible for preparing files for patching.
 *
 * ## `unpatch` stage
 * The unpatch stage unpatches BASIL files and prepares a vanilla copy of the
 * game for clean patches.
 *
 * ## `patch` stage
 * The patch stage actually applies the modifications to the game.
 */
class ModLoader {
	constructor(plugins, Decrypter) {
		this.plugins = plugins;

        this.crypto = new Crypto(Decrypter);

		this.mods = [];
        this.modsDir = path.join(path.dirname(process.mainModule.filename), 'mods');

        this.patchManager = new PatchManager();
	}

	/**
	 * @param window The global window object, which is only accessible from root scripts, and not from modules. We need this to do the code injection.
	 */
	injectCode(window) {
		//These are code overrides, which are used for injecting delta patches into plugins
		//const modLoader = this;
		//const doc = window.document;
		//window.PluginManager = class extends window.PluginManager {
		//	static loadScript(name) {
		//		try {
		//		if(name.includes("vorbis")) {return super.loadScript(name)}
		//		name = name.replace(".js", ".OMORI").replace(".JS", ".OMORI");
		//		var base = path.dirname(process.mainModule.filename);
		//		let buff = fs.readFileSync(base + "/" + this._path + name);
		//		var url = this._path + name;
		//		var script = doc.createElement('script');
		//		script.type = 'text/javascript';

		//		//Delta loading code
		//		let delta = "\n";
		//		{
		//			const fullPath = this._path + name.replace(".js", ".OMORI").replace(".JS", ".OMORI");
		//			if (modLoader.deltaPlugins.has(fullPath)) {
		//				for (const patch of modLoader.deltaPlugins.get(fullPath)) {
		//					delta += patch.read().toString() + "\n";
		//				}
		//			}
		//		}

		//		script.innerHTML = decryptBuffer(buff).toString() + delta;
		//		script._url = url;
		//		doc.body.appendChild(script);
		//		} catch (err) {
		//			alert(`${err.stack}`);
		//		}
		//	}
		//}
	}

	loadMods() {
		const mods = readDir(this.modsDir);

		for (const basename of mods) {
            // skip any file or folder prefixed with an underscore, for marking
            // files that a user does not want to be interpreted as a mod.
            if (basename.startsWith("_")) continue;

            // full path of the mod
            const fullPath = path.join(this.modsDir, basename);

            // the id of the mod
            let id = basename;
            // a flag for if we need to interpret this as a zip file
            let zip = false;

            if (id.endsWith(".zip")) {
                // strip .zip off of id and set zip flag
                id = id.slice(0, -4);
                zip = true;
            }

            if (this.mods.some(mod => mod.id == id)) {
                alert(`Cannot load mod "${modDir}" for having a conflicting ID.`);
                continue;
            } 

            const mod = new Mod(this, id);

            // catch any errors that happen during the loading process
            try {
                if (zip) {
                    mod.openZip(fullPath);
                } else {
                    mod.openFs(fullPath);
                }

                // load mod
                mod.load();

                this.mods.push(mod);
            } catch (err) {
                // oops! error happened during loading
                alert(`${err.stack}`);
            }
		}
	}

	buildMods() {
		for (const mod of this.mods) {
			try {
                // create patcher
                const patcher = this.patchManager.patcher(mod.id);

				mod.build(patcher);

                this.patchManager.applyPatcher(patcher);
			} catch (err) {
				alert(`Failed to build mod "${mod.id}": ${err.stack}`);
			}
		}
	}

	unpatchMods() {
		for (const file of this.config._basilFiles) {
			if (!fs.existsSync(file)) continue;

			const basilBuf = fs.readFileSync(file);
            // file.slice(0, -6) -> slice off .BASIL extension
			fs.writeFileSync(file.slice(0, -6), basilBuf);
		}

		write("save/mods.json", JSON.stringify(this.config));
	}

	patchMods() {
        this.patchManager.patch(this);
	}

    // mod accessors
    
    /**
     * Get a mod by its `id`.
     *
     * @param {string} id - The mod's id.
     * 
     * @returns {Mod|null} - The mod that was found. Returns `null` if no mod
     * was found
     */
    get(id) {
        return this.mods.find(mod => mod.id === id);
    }

	get config() {
		if (this._config) return this._config;

		if (!exists("save/mods.json")) write("save/mods.json", JSON.stringify(defaultConfig));
		this._config = JSON.parse(read("save/mods.json").toString());
		if (!this._config._basilFiles) this._config._basilFiles = [];
		return this._config;
	}
}

module.exports = ModLoader;
