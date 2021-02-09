const fs = require('fs');
const os = require('os');

const LogLevel = require('./LogLevel');

class FileLogger {
    // this._file = file stream for the log file

    constructor(filename) {
        this.open(filename);
    }

    open(filename) {
        this.close();

        this._file = fs.createWriteStream(filename);
    }

    close() {
        if (this._file) {
            this._file.end();
        }
    }

    write(message) {
        this._file.write(`[${LogLevel.levelString(message.level)}] `);
        this._file.write(message.message);
        this._file.write(os.EOL);
    }
}

module.exports = FileLogger;
