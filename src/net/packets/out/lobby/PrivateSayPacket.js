'use strict';

const OutPacket = require('../OutPacket');

class PrivateSayPacket extends OutPacket {
  constructor (fromUsername, message) {
    if (typeof fromUsername !== 'string' || fromUsername.length === 0) {
      throw new Error(`Invalid username ${fromUsername}`);
    }

    if (typeof message !== 'string' || message.length === 0) {
      throw new Error(`Invalid message ${message}`);
    }

    super('lobby', 'sayp', fromUsername, message);
  }
}

module.exports = PrivateSayPacket;
