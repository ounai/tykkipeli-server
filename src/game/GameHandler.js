'use strict';

const GameTurn = require('./GameTurn');

const log = require('../Logger')('GameHandler');

class GameHandler {
  #gameTurns = new Map();

  resetTurn (gameId) {
    if (typeof gameId !== 'number') {
      throw new Error(`Invalid game id ${gameId}`);
    }

    log.debug('Reset game turn for game', gameId);

    this.#gameTurns.set(gameId, new GameTurn());
  }

  getTurn (gameId) {
    if (typeof gameId !== 'number') {
      throw new Error(`Invalid game id ${gameId}`);
    }

    if (!this.#gameTurns.has(gameId)) {
      throw new Error(`Game turn not found for game id ${gameId}`);
    }

    return this.#gameTurns.get(gameId);
  }

  turnExists (gameId) {
    return this.#gameTurns.has(gameId);
  }
}

module.exports = GameHandler;
