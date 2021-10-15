'use strict';

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Broadcast = require('../../../Broadcast');
const OutShoutPacket = require('../../out/game/ShoutPacket');

class ShoutPacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('game', 'shout');
  }

  async handle (connection, packet) {
    const message = packet.getString(2);

    if (typeof message !== 'string' || message.length === 0) {
      throw new Error(`Invalid shout message ${message}`);
    }

    const player = await connection.getPlayer();
    const gamePlayer = await player.getGamePlayer();
    const otherGamePlayers = await gamePlayer.findOthersInGame();

    const broadcastPacket = new OutShoutPacket(gamePlayer.id, message);

    new Broadcast(otherGamePlayers, broadcastPacket, this.server).writeAll();
  }
}

module.exports = ShoutPacket;
