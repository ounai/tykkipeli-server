'use strict';

const Player = require('../../../db/models/Player');
const ReconnectOKPacket = require('../out/ReconnectOKPacket');
const PacketType = require('../../PacketType');

const log = require('../../../Logger')('OldPacket');

class OldPacket {
  type = PacketType.COMMAND;

  match(packet) {
    return packet.startsWith('old');
  }

  async handle(connection, packet) {
    const player = await Player.findById(packet.getNumber(1));

    if (!player.connected) {
      connection.playerId = player.id;

      player.setConnected(true);

      new ReconnectOKPacket().write(connection);

      log.debug(`Reconnected old player (id=${player.id})`);
    } else {
      throw new Error(`Player ${player.id} tried to reconnect but is not disconnected!`);
    }
  }
}

module.exports = OldPacket;

