'use strict';

const PacketType = require('../../PacketType');
const InPacket = require('./InPacket');

class EndPacket extends InPacket {
  type = PacketType.COMMAND;

  match (packet) {
    return packet.startsWith('end');
  }

  async handle (connection) {
    connection.disconnect();
  }
}

module.exports = EndPacket;
