'use strict';

const OutPacket = require('../OutPacket');

class GameListRemovePacket extends OutPacket {
  constructor(game) {
    super('lobby', 'gamelist', 'remove', game.id);
  }
}

module.exports = GameListRemovePacket;

