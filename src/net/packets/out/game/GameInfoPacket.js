'use strict';

const OutPacket = require('../OutPacket');

class GameInfoPacket extends OutPacket {
  async #getArgs (game) {
    const gameInfo = await game.getGameInfo();

    return ['game', 'gameinfo', ...gameInfo];
  }

  constructor (game) {
    super();
    super.asyncArgs(this.#getArgs.bind(this, game));
  }
}

module.exports = GameInfoPacket;
