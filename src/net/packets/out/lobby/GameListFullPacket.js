'use strict';

const OutPacket = require('../OutPacket');
const Game = require('../../../../db/models/Game');

class GameListFullPacket extends OutPacket {
  async #getArgs() {
    const games = await Game.findAll();
    const gameStrings = games.map(game => game.toString());

    return ['gamelist', 'full', games.length, ...gameStrings];
  }

  constructor() {
    super();
    super.asyncArgs(this.#getArgs);
  }
}

module.exports = GameListFullPacket;

