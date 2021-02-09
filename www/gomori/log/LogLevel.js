const ERROR = 0;
const WARNING = 1;
const INFO = 2;
const DEBUG = 3;

function levelString(level) {
    switch (level) {
        case ERROR:
            return 'ERROR';
        case WARNING:
            return 'WARNING';
        case INFO:
            return 'INFO';
        case DEBUG:
            return 'DEBUG';
    }
}

module.exports = { ERROR, WARNING, INFO, DEBUG, levelString };
