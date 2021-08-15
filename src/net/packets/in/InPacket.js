'use strict';

const PacketType = require('../../PacketType');

class InPacket {
  type = PacketType.NONE;

  match(packet) {
    return false;
  }

  handle(connection, packet) {
    return;
  }
}

module.exports = InPacket;

