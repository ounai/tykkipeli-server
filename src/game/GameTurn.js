'use strict';

const Action = require('./Action');
const TurnState = require('./TurnState');

class GameTurn {
  #turnState = TurnState.ACTIONS;
  #actions = new Map();
  #results = new Set();
  #result = null;

  addAction (gamePlayerId, action) {
    if (this.#turnState !== TurnState.ACTIONS) {
      throw new Error(`Action received when turn state is ${this.#turnState.toString()}`);
    }

    if (typeof gamePlayerId !== 'number') {
      throw new Error(`Invalid player id ${gamePlayerId}`);
    }

    if (!(action instanceof Action)) {
      throw new Error(`Invalid action ${action}`);
    }

    if (this.#actions.has(gamePlayerId)) {
      throw new Error(`Duplicate action added for game player ${gamePlayerId}`);
    }

    this.#actions.set(gamePlayerId, action);
  }

  addResult (gamePlayerId, result) {
    if (this.#turnState !== TurnState.RESULTS) {
      throw new Error(`Result received when turn state is ${this.#turnState.toString()}`);
    }

    if (typeof gamePlayerId !== 'number') {
      throw new Error(`Invalid game player id ${gamePlayerId}`);
    }

    if (this.#result === null) {
      this.#result = result;
    } else {
      // TODO: verify that it matches up nicely
    }

    this.#results.add(gamePlayerId);
  }

  setTurnState (turnState) {
    if (!(turnState instanceof TurnState)) {
      throw new Error(`Invalid turn state ${turnState}`);
    }

    if (
      (turnState === TurnState.RESULTS && this.#turnState === TurnState.ACTIONS) ||
      (turnState === TurnState.FINISHED && this.#turnState === TurnState.RESULTS)
    ) {
      this.#turnState = turnState;

      return true;
    } else {
      return false;
    }
  }

  get actions () {
    return this.#actions;
  }

  get resultsCount () {
    return this.#results.size;
  }

  get result () {
    return this.#result;
  }
}

module.exports = GameTurn;
