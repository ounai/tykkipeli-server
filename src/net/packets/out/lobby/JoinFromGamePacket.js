'use strict';

const OutPacket = require('../OutPacket');

class JoinFromGamePacket extends OutPacket {
  constructor (player) {
    super('lobby', 'joinfromgame', player.getLobbyInfoString());
  }
}

module.exports = JoinFromGamePacket;
