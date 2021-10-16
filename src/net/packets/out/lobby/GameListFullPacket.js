'use strict';

const OutPacket = require('../OutPacket');
const Game = require('../../../../db/models/Game');

class GameListFullPacket extends OutPacket {
  async #getArgs () {
    const games = await Game.findAll();
    const gameStrings = [];

    for (const game of games) {
      gameStrings.push(await game.getGameListItemString());
    }

    return ['lobby', 'gamelist', 'full', games.length, ...gameStrings];
  }

  constructor () {
    super();
    super.asyncArgs(this.#getArgs);
  }
}

module.exports = GameListFullPacket;
