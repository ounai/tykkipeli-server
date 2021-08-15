'use strict';

const OutPacket = require('../OutPacket');
const Game = require('../../../../db/models/Game');

class GameListFullPacket extends OutPacket {
  async #getArgs() {
    const games = await Game.findAll();

    return [
      'gamelist',
      'full',
      games.length,
      ...games.map(game => game.toString())
    ];
  }

  constructor() {
    super();
    super.asyncArgs(this.#getArgs);
  }
}

module.exports = GameListFullPacket;

