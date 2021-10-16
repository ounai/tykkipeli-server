'use strict';

const PacketType = require('../../PacketType');

class InPacket {
  type = PacketType.NONE;
  server;

  constructor (server) {
    this.server = server;
  }

  match () {
    return false;
  }

  handle () {}
}

module.exports = InPacket;
