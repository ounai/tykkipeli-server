'use strict';

const chalk = require('chalk');

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Player = require('../../../../db/models/Player');
const PrivateSayOutPacket = require('../../out/lobby/PrivateSayPacket.js');

const log = require('../../../../Logger')('PrivateSayPacket');

class PrivateSayPacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('lobby', 'sayp');
  }

  async handle (connection, packet) {
    const sourcePlayer = await connection.getPlayer();

    const targetUsername = packet.getString(2);
    const message = packet.getString(3);

    const targetPlayer = await Player.findByUsername(targetUsername);

    if (!targetPlayer) {
      log.error('Not sending private message to', chalk.magenta(targetUsername), '- could not find player');

      return;
    }

    const fromColorString = sourcePlayer.toColorString();
    const toColorString = targetPlayer.toColorString();

    log.debug(fromColorString, '->', toColorString, '(private):', chalk.cyan(message));

    if (!targetPlayer.isConnected) {
      log.error('Not sending private message to', toColorString, '- player is not connected');

      return;
    }

    const targetConnection = this.server.connectionHandler.getPlayerConnection(targetPlayer);

    if (!targetConnection) {
      log.error('Not sending private message to', toColorString, '- invalid connection', targetConnection);

      return;
    }

    new PrivateSayOutPacket(sourcePlayer.username, message).write(targetConnection);
  }
}

module.exports = PrivateSayPacket;
