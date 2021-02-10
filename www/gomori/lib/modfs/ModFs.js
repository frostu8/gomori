const ospath = require('path/posix');

/**
 * A mod filesystem is responsible for allowing access to the mod's contents.
 * Because a mod can be a zip *or* a directory, it is important to be able to
 * abstract those possibilities for easier programming.
 */
class ModFs {
    /**
     * Gets the file at a path.
     *
     * @param {string} path - The path to the file, relative to the `ModFs`.
     * @returns {Buffer|null} - The file. Null if it couldn't be found or the 
     * path is a directory.
     */
    getFile(path) {
        throw new Error('Not implemented');
    }

    /**
     * Gets all of the files and directories in a directory.
     *
     * @param {string} path - The path to the directory, relative to the 
     * `ModFs`.
     * @returns {string[]|null} - Each file in the directory. If the path ends 
     * in a /, then it's a directory and needs to be recursed into. Null if the
     * directory couldn't be found.
     */
    getDir(path) {
        throw new Error('Not implemented');
    }

    /**
     * Lists every child of the directory, relative to the directory. Recurses 
     * into children directories. Returns null if the path isn't a directory.
     */
    listDir(path) {
        const dir = this.getDir(path);
        if (dir) {
            let list = [];

            // recurse into directory
            dir.forEach(baseInner => {
                this._listDir(path, baseInner, list);
            });

            return list;
        } else {
            return null;
        }
    }

    _listDir(path, base, list) {
        // get the full path
        const fullPath = ospath.join(path, base);

        const dir = this.getDir(fullPath);
        if (dir) {
            // recurse into directory
            dir.forEach(baseInner => {
                this._listDir(path, ospath.join(base, baseInner), list);
            });
        } else {
            list.push(base);
        }
    }
}

module.exports = ModFs;
