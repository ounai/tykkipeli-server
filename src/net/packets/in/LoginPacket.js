'use strict';

const InPacket = require('./InPacket');
const PacketType = require('../../PacketType');
const JoinLobbyEvent = require('../../../events/player/JoinLobbyEvent');

const BasicInfoPacket = require('../out/BasicInfoPacket');

const log = require('../../../Logger')('LoginPacket');

class LoginPacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('login');
  }

  async handle (connection, packet) {
    const player = await connection.getPlayer();

    const username = packet.getString(1);

    if (typeof username === 'string' && username.length > 0 && username !== '-') {
      await player.requestUsername(username);
    }

    log.info('Login', player.toColorString());

    if (!player.hasLoggedIn) {
      log.debug('First LoginPacket, sending basic info');

      new BasicInfoPacket(player).write(connection);

      await player.setHasLoggedIn(true);
    } else {
      log.debug('Player has logged in before, not resending basic info again');
    }

    new JoinLobbyEvent(this.server, connection, player).fire();
  }
}

module.exports = LoginPacket;
