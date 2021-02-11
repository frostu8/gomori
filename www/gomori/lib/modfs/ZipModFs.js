const AdmZip = require('../../../adm-zip/adm-zip');

const ModFs = require('./ModFs');

const ospath = require('path/posix');

/**
 * A `ModFs` that implements access to a zip file.
 */
class ZipModFs extends ModFs {
    constructor(filename, baseDir) {
        super();

        this._zip = new AdmZip(filename);
        this._baseDir = baseDir;
    }

    getFile(path) {
        let entry = this._zip.getEntry(this._expand(path));

        if (entry && !entry.isDirectory) {
            return entry.getData();
        } else {
            return null;
        }
    }

    getDir(path) {
        let entry = this._zip.getEntry(this._expand(path));

        if (entry && entry.isDirectory) {
            return this._zip.getEntryChildren(entry)
                .map(entry => entry.name);
        } else {
            return null;
        }
    }

    zip() {
        return this._zip;
    }

    _expand(path) {
        return ospath.join(this._baseDir, path);
    }
}

module.exports = ZipModFs;
