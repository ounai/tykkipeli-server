'use strict';

const OutPacket = require('./OutPacket');

class ServerFullPacket extends OutPacket {
  constructor() {
    super('error', 'serverfull');
  }
}

module.exports = ServerFullPacket;

