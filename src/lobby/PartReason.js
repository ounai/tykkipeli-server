'use strict';

const partReasons = {};

class PartReason {
  static USER_LEFT = new PartReason('USER_LEFT', 1);
  static CONNECTION_PROBLEMS = new PartReason('CONNECTION_PROBLEMS', 2);
  static CREATED_GAME = new PartReason('CREATED_GAME', 4);
  static JOINED_GAME = new PartReason('JOINED_GAME', 5);

  #name;
  #code;

  static get (code) {
    return partReasons[code] ?? null;
  }

  constructor (name, code) {
    this.#name = name;
    this.#code = code;

    partReasons[code] = this;
  }

  toString () {
    return `PartReason.${this.#name}`;
  }

  valueOf () {
    return this.#code;
  }
}

module.exports = PartReason;
