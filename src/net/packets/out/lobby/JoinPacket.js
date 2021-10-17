'use strict';

const OutPacket = require('../OutPacket');

class JoinPacket extends OutPacket {
  constructor (player) {
    super('lobby', 'join', player.getLobbyInfoString());
  }
}

module.exports = JoinPacket;
