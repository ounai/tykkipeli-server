'use strict';

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Broadcast = require('../../../Broadcast');
const OutSayPacket = require('../../out/game/SayPacket');
const GamePlayer = require('../../../../db/models/GamePlayer');

class SayPacket extends InPacket {
  type = PacketType.DATA;

  match(packet) {
    return packet.startsWith('game', 'say');
  }

  async handle(connection, packet) {
    const message = packet.getString(2);

    if (typeof(message) !== 'string' || message.length === 0) {
      throw new Error(`Invalid chat message ${message}`);
    }

    const player = await connection.getPlayer();
    const gamePlayer = await player.getGamePlayer();

    if (!(gamePlayer instanceof GamePlayer)) {
      throw new Error(`Invalid game player ${gamePlayer}`);
    }

    const otherGamePlayers = await gamePlayer.findOthersInGame();

    const broadcastPacket = new OutSayPacket(player.username, message);

    new Broadcast(otherGamePlayers, broadcastPacket, this.server).writeAll();
  }
}

module.exports = SayPacket;

