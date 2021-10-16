'use strict';

const VersionOKPacket = require('../out/VersionOKPacket');
const VersionNotOKPacket = require('../out/VersionNotOKPacket');
const PacketType = require('../../PacketType');
const InPacket = require('./InPacket');

const log = require('../../../Logger')('VersionPacket');

class VersionPacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('version');
  }

  handle (connection, packet) {
    const versionNumber = packet.getNumber(1);

    if (versionNumber === 24) {
      new VersionOKPacket().write(connection);
    } else {
      log.debug('Invalid version number', versionNumber);

      new VersionNotOKPacket().write(connection);

      connection.disconnect();
    }
  }
}

module.exports = VersionPacket;
