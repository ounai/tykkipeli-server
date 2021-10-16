'use strict';

const chalk = require('chalk');

const Player = require('../../../db/models/Player');
const PacketType = require('../../PacketType');
const InPacket = require('./InPacket');
const ReconnectOKPacket = require('../out/ReconnectOKPacket');
const ReconnectFailedPacket = require('../out/ReconnectFailedPacket');

const log = require('../../../Logger')('OldPacket');

class OldPacket extends InPacket {
  type = PacketType.COMMAND;

  match (packet) {
    return packet.startsWith('old');
  }

  async handle (connection, packet) {
    log.debug('OldPacket received from connection', connection.id);

    const player = await Player.findById(packet.getNumber(1));

    if (player instanceof Player) {
      if (!player.isConnected) {
        connection.playerId = player.id;

        await player.setConnected(true);
        await player.setConnectionId(connection.id);

        log.debug(`Reconnected old player (connection id=${connection.id})`);

        new ReconnectOKPacket().write(connection);
      } else {
        log.debugError('Player', chalk.magenta(player.toString()), 'tried to reconnect but is not disconnected!');

        new ReconnectFailedPacket().write(connection);
      }
    } else {
      log.debugError('Invalid player', chalk.magenta(player.toString()), 'for connection', connection.id);

      new ReconnectFailedPacket().write(connection);
    }
  }
}

module.exports = OldPacket;
