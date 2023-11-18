'use strict';

const GameTurn = require('./GameTurn');

const log = require('../Logger')('GameHandler');

class GameHandler {
  #gameTurns = new Map();
  #previousTurns = new Map();

  resetTurn (gameId, clearPrevious = false) {
    if (typeof gameId !== 'number') {
      throw new Error(`Invalid game id ${gameId}`);
    }

    log.debug('Reset game turn for game', gameId);

    if (clearPrevious) {
      this.#previousTurns.set(gameId, null);
    } else if (this.hasActiveTurn(gameId)) {
      this.#previousTurns.set(gameId, this.getTurn(gameId));
    }

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

  hasActiveTurn (gameId) {
    return this.#gameTurns.has(gameId);
  }

  getPreviousTurn (gameId) {
    if (typeof gameId !== 'number') {
      throw new Error(`Invalid game id ${gameId}`);
    }

    if (!this.#previousTurns.has(gameId)) {
      throw new Error(`Game turn not found for game id ${gameId}`);
    }

    return this.#previousTurns.get(gameId);
  }

  hasPreviousTurn (gameId) {
    return this.#previousTurns.has(gameId);
  }

  deleteTurn (gameId) {
    this.#gameTurns.delete(gameId);
    this.#previousTurns.delete(gameId);
  }
}

module.exports = GameHandler;
