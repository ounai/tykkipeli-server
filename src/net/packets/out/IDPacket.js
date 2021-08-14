'use strict';

const OutPacket = require('./OutPacket');
const PacketType = require('../../PacketType');

class IDPacket extends OutPacket {
  constructor(id) {
    super('id', id);
    super.setType(PacketType.COMMAND);
  }
}

module.exports = IDPacket;

