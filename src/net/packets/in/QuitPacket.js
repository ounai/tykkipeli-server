'use strict';

const InPacket = require('./InPacket');
const PacketType = require('../../PacketType');

class QuitPacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('quit');
  }

  handle (connection) {
    connection.disconnect();
  }
}

module.exports = QuitPacket;
