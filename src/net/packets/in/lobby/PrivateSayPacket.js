'use strict';

const chalk = require('chalk');

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Player = require('../../../../db/models/Player');
const PrivateSayOutPacket = require('../../out/lobby/PrivateSayPacket.js');

const log = require('../../../../Logger')('PrivateSayPacket');

class PrivateSayPacket extends InPacket {
  type = PacketType.DATA;

  match(packet) {
    return packet.startsWith('lobby', 'sayp');
  }

  async handle(connection, packet) {
    const sourcePlayer = await connection.getPlayer();

    const targetUsername = packet.getString(2);
    const message = packet.getString(3);

    const targetPlayer = await Player.findByUsername(targetUsername);

    if (!targetPlayer) {
      return log.error('Not sending private message to', chalk.magenta(targetUsername), '- could not find player');
    }

    log.debug(chalk.magenta(sourcePlayer.toString()), '->', chalk.magenta(targetPlayer.toString()), '(private):', chalk.cyan(message));

    if (!targetPlayer.isConnected) {
      return log.error('Not sending private message to', chalk.magenta(targetPlayer), '- player is not connected');
    }

    const targetConnection = this.server.connectionHandler.getPlayerConnection(targetPlayer);

    if (!targetConnection) {
      return log.error('Not sending private message to', chalk.magenta(targetPlayer), '- invalid connection', targetConnection);
    }

    new PrivateSayOutPacket(sourcePlayer.username, message).write(targetConnection);
  }
}

module.exports = PrivateSayPacket;

