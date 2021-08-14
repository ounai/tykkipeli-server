'use strict';

const OutPacket = require('./OutPacket');
const PacketType = require('../../PacketType');

class ReconnectOKPacket extends OutPacket {
  constructor() {
    super('rcok');
    super.setType(PacketType.COMMAND);
  }
}

module.exports = ReconnectOKPacket;

