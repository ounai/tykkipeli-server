'use strict';

const OutPacket = require('../OutPacket');

class JoinPacket extends OutPacket {
  constructor (player) {
    super(async () => [
      'game',
      'join',
      await player.getGameInfoString()
    ]);
  }
}

module.exports = JoinPacket;
