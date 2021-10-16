'use strict';

const OutPacket = require('../OutPacket');

class GameListAddPacket extends OutPacket {
  async #getArgs (game) {
    const gameListItem = await game.getGameListItem();

    return ['lobby', 'gamelist', 'add', ...gameListItem];
  }

  constructor (game) {
    super();
    super.asyncArgs(this.#getArgs.bind(this, game));
  }
}

module.exports = GameListAddPacket;
