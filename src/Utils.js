'use strict';

const fs = require('fs');

class Utils {
  static getRandomInt (max) {
    return Math.floor(Math.random() * max);
  }

  static getFilenamesInDirectory (dir, ext = null) {
    return fs.readdirSync(dir)
      .filter(filename => ext === null || filename.endsWith(`.${ext}`));
  }

  static currentTimeString () {
    const dateTimeFormat = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    return dateTimeFormat.format(new Date());
  }

  static isIP (str) {
    return typeof str === 'string' &&
      (/^([0-9]{1,3}\.){3}[0-9]{1,3}$/.test(str) || str === 'localhost');
  }

  static isPort (n) {
    return typeof n === 'number' &&
      !isNaN(n) && n > 0 && n <= 65535;
  }

  static validateIP (ip) {
    if (!Utils.isIP(ip)) {
      throw new Error(`Invalid ip ${ip}`);
    }
  }

  static validatePort (port) {
    if (!Utils.isPort(port)) {
      throw new Error(`Invalid port ${port}`);
    }
  }
}

module.exports = Utils;
