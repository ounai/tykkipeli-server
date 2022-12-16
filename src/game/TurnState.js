'use strict';

class TurnState {
  static ACTIONS = new TurnState('ACTIONS');
  static RESULTS = new TurnState('RESULTS');
  static FINISHED = new TurnState('FINISHED');

  #name;

  constructor (name) {
    this.#name = name;
  }

  toString () {
    return `TurnState.${this.#name}`;
  }
}

module.exports = TurnState;
