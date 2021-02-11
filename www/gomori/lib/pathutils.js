const pathop = require('path');

const WWW_DIR = pathop.dirname(process.mainModule.filename);

function expand(path) {
    return pathop.join(WWW_DIR, path);
}

const CONFIG_PATH = expand('save/mods.json');

module.exports = { expand, WWW_DIR, CONFIG_PATH };
