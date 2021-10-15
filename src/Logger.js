'use strict';

const chalk = require('chalk');

const { currentTimeString } = require('./Utils');

const debug = (process.env.NODE_ENV !== 'production');
const disabled = (process.env.NODE_ENV === 'test');

const maxTitleLength = 16;

class Logger {
  title;

  constructor(title) {
    if (debug) {
      if (typeof(title) !== 'string') this.title = null;
      else {
        this.title = title.slice(0, maxTitleLength);

        if (title.length > maxTitleLength) {
          console.log(
            '[',
            chalk.red('Logger warning: Title'),
            chalk.magenta(title),
            chalk.red('is too long, truncated to'),
            chalk.magenta(this.title),
            ']'
          );
        }
      }
    } else {
      this.title = null;
    }
  }

  #getLeader(stream, spaces = 0) {
    const title = (
      this.title
        ? (' '.repeat(spaces) + ' '.repeat(maxTitleLength - this.title.length) + this.title)
        : ''
    );

    return `[${currentTimeString()}, ${stream}]${title}`;
  }

  info(...args) {
    if (!disabled) console.log(chalk.green(this.#getLeader('INFO', 2)), ...args);
  }

  debug(...args) {
    if (debug && !disabled) console.log(chalk.yellow(this.#getLeader('DEBUG', 1)), ...args);
  }

  error(...args) {
    if (!disabled) console.error(chalk.red(this.#getLeader('ERROR', 1)), ...args);
  }

  debugError(...args) {
    if (debug && !disabled) this.error(...args);
  }
}

const defaultLogger = new Logger();

module.exports = title => new Logger(title);
module.exports.info = (...args) => defaultLogger.info(...args);
module.exports.debug = (...args) => defaultLogger.debug(...args);
module.exports.error = (...args) => defaultLogger.error(...args);
module.exports.debugError = (...args) => defaultLogger.debugError(...args);

