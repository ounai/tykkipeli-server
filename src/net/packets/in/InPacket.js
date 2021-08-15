'use strict';

const PacketType = require('../../PacketType');

class InPacket {
  type = PacketType.NONE;

  match() {
    return false;
  }

  handle() {
    return;
  }
}

module.exports = InPacket;

