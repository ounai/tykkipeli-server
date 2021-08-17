'use strict';

const InPacket = require('./InPacket');
const PacketType = require('../../PacketType');

class PongPacket extends InPacket {
  type = PacketType.COMMAND;

  match(packet) {
    return packet.startsWith('pong');
  }
}

module.exports = PongPacket;

