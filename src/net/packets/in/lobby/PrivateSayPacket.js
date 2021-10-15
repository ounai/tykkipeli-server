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

    const fromStr = chalk.magenta(sourcePlayer.toString());
    const toStr = chalk.magenta(targetPlayer.toString());

    log.debug(fromStr, '->', toStr, '(private):', chalk.cyan(message));

    if (!targetPlayer.isConnected) {
      log.error('Not sending private message to', toStr, '- player is not connected');

      return;
    }

    const targetConnection = this.server.connectionHandler.getPlayerConnection(targetPlayer);

    if (!targetConnection) {
      log.error('Not sending private message to', toStr, '- invalid connection', targetConnection);

      return;
    }

    new PrivateSayOutPacket(sourcePlayer.username, message).write(targetConnection);
  }
}

module.exports = PrivateSayPacket;
