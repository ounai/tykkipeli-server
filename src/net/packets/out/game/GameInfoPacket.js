'use strict';

const OutPacket = require('../OutPacket');

class GameInfoPacket extends OutPacket {
  constructor (game) {
    super(async () => {
      const gameInfo = await game.getGameInfo();

      return ['game', 'gameinfo', ...gameInfo];
    });
  }
}

module.exports = GameInfoPacket;
