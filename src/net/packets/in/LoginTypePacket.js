'use strict';

const InPacket = require('./InPacket');
const PacketType = require('../../PacketType');
const StatusPacket = require('../out/StatusPacket');

const log = require('../../../Logger')('LoginTypePacket');

class LoginTypePacket extends InPacket {
  type = PacketType.DATA;

  match(packet) {
    return packet.startsWith('logintype');
  }

  async handle(connection, packet) {
    const registered = (packet.getString(1) === 'reg');

    log.debug('Player registered:', registered);

    (await connection.getPlayer()).setRegistered(registered);

    new StatusPacket('login').write(connection);
  }
}

module.exports = LoginTypePacket;

