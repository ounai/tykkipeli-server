'use strict';

const OutPacket = require('../OutPacket');

class ShoutPacket extends OutPacket {
  constructor(gamePlayerId, message) {
    if (typeof(gamePlayerId) !== 'number' || isNaN(gamePlayerId)) {
      throw new Error(`Invalid game player ID ${gamePlayerId}`);
    }

    if (typeof(message) !== 'string' || message.length === 0) {
      throw new Error(`Invalid message ${message}`);
    }

    super('game', 'shout', gamePlayerId, message);
  }
}

module.exports = ShoutPacket;

