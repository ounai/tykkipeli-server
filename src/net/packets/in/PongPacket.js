'use strict';

const InPacket = require('./InPacket');
const PacketType = require('../../PacketType');
const Player = require('../../../db/models/Player');

class PongPacket extends InPacket {
  type = PacketType.COMMAND;

  match (packet) {
    return packet.startsWith('pong');
  }

  async handle (connection) {
    if (typeof connection.playerId === 'number') {
      const player = await Player.findById(connection.playerId);

      if (player) await player.updateLastPong();
    }
  }
}

module.exports = PongPacket;
