'use strict';

const OutPacket = require('./OutPacket');
const PacketType = require('../../PacketType');

class ReconnectFailedPacket extends OutPacket {
  constructor() {
    super('rcf');
    super.setType(PacketType.COMMAND);
  }
}

module.exports = ReconnectFailedPacket;

