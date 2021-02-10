const ospath = require('path/posix');

function replaceExt(path, ext) {
    return path.slice(0, -ospath.extname(path).length) + ext;
}

module.exports = { replaceExt };
