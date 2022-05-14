'use strict';

const OutPacket = require('../OutPacket');

class GameListAddPacket extends OutPacket {
  constructor (game) {
    super(async () => [
      'lobby',
      'gamelist',
      'add',
      ...await game.getGameListItem()
    ]);
  }
}

module.exports = GameListAddPacket;
