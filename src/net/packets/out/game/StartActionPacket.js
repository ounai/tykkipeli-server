'use strict';

const OutPacket = require('../OutPacket');

class StartActionPacket extends OutPacket {
  constructor () {
    super('game', 'startaction');
  }
}

module.exports = StartActionPacket;
