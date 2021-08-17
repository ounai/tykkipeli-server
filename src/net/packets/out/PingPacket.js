'use strict';

const OutPacket = require('./OutPacket');
const PacketType = require('../../PacketType');

class PingPacket extends OutPacket {
  constructor() {
    super('ping');
    super.setType(PacketType.COMMAND);
  }
}

module.exports = PingPacket;

