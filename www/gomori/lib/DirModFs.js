const ModFs = require('./ModFs');

const fs = require('fs');
const ospath = require('path/posix');

/**
 * A `ModFs` that implements raw filesystem accesses.
 */
class DirModFs extends ModFs {
    constructor(path) {
        super();

        this._path = path;
    }

    getFile(path) {
        let fullPath = ospath.join(this._path, path);

        let stats = fs.statSync(fullPath);
        if (stats.isFile()) {
            return fs.readFileSync(fullPath);
        } else {
            return null;
        }
    }

    getDir(path) {
        let fullPath = ospath.join(this._path, path);

        if (fs.existsSync(fullPath)) {
            let stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                return fs.readdirSync(fullPath);
            }
        }

        return null;
    }
}

module.exports = DirModFs;
