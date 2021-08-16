'use strict';

const Player = require('../../../db/models/Player');
const ReconnectOKPacket = require('../out/ReconnectOKPacket');
const PacketType = require('../../PacketType');
const InPacket = require('./InPacket');

const log = require('../../../Logger')('OldPacket');

class OldPacket extends InPacket {
  type = PacketType.COMMAND;

  match(packet) {
    return packet.startsWith('old');
  }

  async handle(connection, packet) {
    log.debug('OldPacket received from connection', connection.id);

    const player = await Player.findById(packet.getNumber(1));

    if (!player || !(player instanceof Player)) {
      if (!player.isConnected) {
        connection.playerId = player.id;

        await player.setConnected(true);
        await player.setConnectionId(connection.id);

        log.debug(`Reconnected old player (id=${player.id}, connectionId=${player.connectionId})`);

        new ReconnectOKPacket().write(connection);
      } else {
        throw new Error(`Player ${player.toString()} tried to reconnect but is not disconnected!`);
      }
    } else {
      throw new Error(`Invalid player ${player} for connection ${connection.id}`);
    }
  }
}

module.exports = OldPacket;

