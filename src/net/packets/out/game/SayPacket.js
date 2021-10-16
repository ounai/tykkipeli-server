'use strict';

const OutPacket = require('../OutPacket');

class SayPacket extends OutPacket {
  constructor (username, message) {
    if (typeof username !== 'string' || username.length === 0) {
      throw new Error(`Invalid username ${username}`);
    }

    if (typeof message !== 'string' || message.length === 0) {
      throw new Error(`Invalid message ${message}`);
    }

    super('game', 'say', username, message);
  }
}

module.exports = SayPacket;
