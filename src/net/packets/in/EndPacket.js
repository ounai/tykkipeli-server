'use strict';

const PacketType = require('../../PacketType');
const Player = require('../../../db/models/Player');

const log = require('../../../Logger')('EndPacket');

class EndPacket {
  type = PacketType.COMMAND;

  match(packet) {
    return packet.startsWith('end');
  }

  async handle(connection) {
    log.debug('End packet received, disconnecting client');

    if (typeof(connection.playerId) === 'number' && !isNaN(connection.playerId)) {
      log.debug('Deleting player', connection.playerId);

      await Player.destroyById(connection.playerId);
    }

    connection.disconnect();
  }
}

module.exports = EndPacket;

