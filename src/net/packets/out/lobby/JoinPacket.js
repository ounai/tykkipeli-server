'use strict';

const OutPacket = require('../OutPacket');

class JoinPacket extends OutPacket {
  constructor (player) {
    super('lobby', 'join', player.getUserInfoString(3));
  }
}

module.exports = JoinPacket;
