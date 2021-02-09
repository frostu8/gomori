const LogLevel = require('./LogLevel');
const LogMessage = require('./LogMessage');
const FileLogger = require('./FileLogger');

class Logger {
    // this.levelFilter = the highest log level that will be printed
    //
    // this.messages    = all of the log messages in a list
    // this._fileLogger = the FileLogger of this Logger

    constructor(filename, levelFilter) {
        this.levelFilter = levelFilter;

        this.messages = [];
        this._fileLogger = new FileLogger(filename);
    }

    // log functions
    log(message, level) {
        if (level <= this.levelFilter) {
            // add message
            this._push(new LogMessage(message, level));
        }
    }

    error(message) {
        this.log(message, LogLevel.ERROR);
    }

    warning(message) {
        this.log(message, LogLevel.WARNING);
    }

    info(message) {
        this.log(message, LogLevel.INFO);
    }

    debug(message) {
        this.log(message, LogLevel.DEBUG);
    }

    // other functions
    errorCount() {
        return this.messages
            .filter((m) => m.level <= LogLevel.ERROR)
            .length;
    }

    // private log functions
    _push(message) {
        this.messages.push(message);

        // call underlying loggers
        this._fileLogger.write(message);
    }
}

module.exports = Logger;
