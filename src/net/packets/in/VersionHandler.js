'use strict';

const StatusPacket = require('../out/StatusPacket');
const VersionOKPacket = require('../out/VersionOKPacket');
const VersionNotOKPacket = require('../out/VersionNotOKPacket');
const PacketType = require('../../PacketType');

const log = require('../../../Logger')('VersionHandler');

class VersionHandler {
  match(packet) {
    return (
      packet.type === PacketType.DATA
      && packet.startsWith('version')
    );
  }

  handle(connection, packet) {
    const versionNumber = packet.getNumber(1);

    if (versionNumber === 24) {
      new VersionOKPacket().write(connection);
      new StatusPacket('login').write(connection);
    } else {
      log.debug('Invalid version number', versionNumber);

      new VersionNotOKPacket().write(connection);

      connection.disconnect();
    }
  }
}

module.exports = VersionHandler;

