'use strict';

const PacketType = require('../../PacketType');

class InPacket {
  type = PacketType.NONE;
  usesPlayer = false;
  server;

  constructor(server) {
    this.server = server;
  }

  match() {
    return false;
  }

  handle() {
    return;
  }
}

module.exports = InPacket;

