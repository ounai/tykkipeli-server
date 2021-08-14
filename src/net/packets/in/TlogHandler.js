'use strict';

const PacketType = require('../../PacketType');

const log = require('../../../Logger')('TlogHandler');

class TlogHandler {
  match(packet) {
    return (
      packet.type === PacketType.STRING
      && packet.startsWith('tlog')
    );
  }

  handle(connection, packet) {
    log.debug('tlog:', `[${packet.args.slice(1).join(', ')}]`);
  }
}

module.exports = TlogHandler;

