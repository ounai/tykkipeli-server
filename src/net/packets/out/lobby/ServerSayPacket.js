'use strict';

const OutPacket = require('../OutPacket');

class ServerSayPacket extends OutPacket {
  constructor (message) {
    if (typeof message !== 'string' || message.length === 0) {
      throw new Error(`Invalid message ${message}`);
    }

    super('lobby', 'serversay', message);
  }
}

module.exports = ServerSayPacket;
