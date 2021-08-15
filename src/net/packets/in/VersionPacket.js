'use strict';

const StatusPacket = require('../out/StatusPacket');
const VersionOKPacket = require('../out/VersionOKPacket');
const VersionNotOKPacket = require('../out/VersionNotOKPacket');
const PacketType = require('../../PacketType');

const log = require('../../../Logger')('VersionPacket');

class VersionPacket {
  type = PacketType.DATA;

  match(packet) {
    return packet.startsWith('version');
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

module.exports = VersionPacket;

