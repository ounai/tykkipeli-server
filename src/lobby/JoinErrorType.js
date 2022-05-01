'use strict';

const joinErrorTypes = {};

class JoinErrorType {
  static GAME_DOES_NOT_EXIST = new JoinErrorType('GAME_DOES_NOT_EXIST', 1);
  static GAME_STARTED = new JoinErrorType('GAME_STARTED', 2);
  static INCORRECT_PASSWORD = new JoinErrorType('INCORRECT_PASSWORD', 3);
  static REGISTERED_PLAYERS_ONLY = new JoinErrorType('REGISTERED_PLAYERS_ONLY', 4);

  #name;
  #code;

  static get (code) {
    return joinErrorTypes[code] ?? null;
  }

  constructor (name, code) {
    this.#name = name;
    this.#code = code;

    joinErrorTypes[code] = this;
  }

  toString () {
    return `JoinErrorType.${this.#name}`;
  }

  valueOf () {
    return this.#code;
  }
}

module.exports = JoinErrorType;
