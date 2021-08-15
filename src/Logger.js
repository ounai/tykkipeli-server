'use strict';

const chalk = require('chalk');

const { currentTimeString } = require('./utils');

const debug = (process.env.NODE_ENV !== 'production');
const maxTitleLength = 16;

class Logger {
  title;

  constructor(title) {
    if (debug) {
      if (typeof(title) !== 'string') this.title = null;
      else this.title = title.slice(0, maxTitleLength);
    } else {
      this.title = null;
    }
  }

  #getLeader(stream, spaces = 0) {
    return `[${currentTimeString()}, ${stream}]`
      + (this.title ? (' '.repeat(spaces) + ' '.repeat(maxTitleLength - this.title.length) + this.title) : '');
  }

  info(...args) {
    console.log(chalk.green(this.#getLeader('INFO', 2)), ...args);
  }

  debug(...args) {
    if (debug) console.log(chalk.yellow(this.#getLeader('DEBUG', 1)), ...args);
  }

  error(...args) {
    console.error(chalk.red(this.#getLeader('ERROR', 1)), ...args);
  }

  debugError(...args) {
    if (debug) this.error(...args);
  }
}

const defaultLogger = new Logger();

module.exports = title => new Logger(title);
module.exports.info = (...args) => defaultLogger.info(...args);
module.exports.debug = (...args) => defaultLogger.debug(...args);
module.exports.error = (...args) => defaultLogger.error(...args);
module.exports.debugError = (...args) => defaultLogger.debugError(...args);

