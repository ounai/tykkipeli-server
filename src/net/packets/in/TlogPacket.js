'use strict';

const PacketType = require('../../PacketType');
const InPacket = require('./InPacket');

const log = require('../../../Logger')('TlogPacket');

class TlogPacket extends InPacket {
  type = PacketType.STRING;

  match(packet) {
    return packet.startsWith('tlog');
  }

  handle(connection, packet) {
    log.debug('tlog:', `[${packet.args.slice(1).join(', ')}]`);
  }
}

module.exports = TlogPacket;

