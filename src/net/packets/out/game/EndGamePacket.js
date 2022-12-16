'use strict';

const OutPacket = require('../OutPacket');

class EndGamePacket extends OutPacket {
  constructor () {
    super('game', 'endgame');
  }
}

module.exports = EndGamePacket;
