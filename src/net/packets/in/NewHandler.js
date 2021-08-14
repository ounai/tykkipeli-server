'use strict';

const Player = require('../../../db/models/Player');
const IDPacket = require('../out/IDPacket');
const PacketType = require('../../PacketType');

const log = require('../../../Logger')('NewHandler');

class NewHandler {
  match(packet) {
    return (
      packet.type === PacketType.COMMAND
      && packet.startsWith('new')
    );
  }

  async handle(connection) {
    const player = await Player.create();

    connection.playerId = player.id;

    player.setConnected(true);

    new IDPacket(player.id).write(connection);

    log.debug(`Created new player (id=${player.id})`);
  }
}

module.exports = NewHandler;

