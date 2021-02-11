const pathop = require('path');

const WWW_DIR = pathop.dirname(process.mainModule.filename);

function absPath(path) {
    return pathop.join(WWW_DIR, path);
}

module.exports = { absPath, WWW_DIR };
