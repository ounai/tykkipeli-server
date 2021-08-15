'use strict';

const OutPacket = require('../OutPacket');

class OwnJoinPacket extends OutPacket {
  constructor(player) {
    super('lobby', 'ownjoin', player.getUserInfoString(3));
  }
}

module.exports = OwnJoinPacket;

