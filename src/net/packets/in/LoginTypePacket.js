'use strict';

const InPacket = require('./InPacket');
const PacketType = require('../../PacketType');
const StatusPacket = require('../out/StatusPacket');

const log = require('../../../Logger')('LoginTypePacket');

class LoginTypePacket extends InPacket {
  type = PacketType.DATA;
  usesPlayer = true;

  match(packet) {
    return packet.startsWith('logintype');
  }

  handle(connection, packet, player) {
    const registered = (packet.getString(1) === 'reg');

    log.debug('Player registered:', registered);

    player.setRegistered(registered);

    new StatusPacket('login').write(connection);
  }
}

module.exports = LoginTypePacket;

