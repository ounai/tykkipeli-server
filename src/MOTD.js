'use strict';

class MOTD {
  #motd = null;

  #isValid (str) {
    return typeof str === 'string' && str.length > 0;
  }

  constructor (motd) {
    if (this.#isValid(motd)) this.#motd = motd;
    else this.#motd = null;
  }

  setMOTD (str) {
    if (!this.#isValid(str)) {
      throw new Error(`Invalid MOTD ${str}`);
    }

    this.#motd = str;
  }

  isSet () {
    return this.#motd !== null;
  }

  toString () {
    return this.#motd ?? '-';
  }
}

module.exports = MOTD;
