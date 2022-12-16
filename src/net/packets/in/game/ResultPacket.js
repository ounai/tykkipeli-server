'use strict';

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const ResultReceivedEvent = require('../../../../events/game/ResultReceivedEvent');

const log = require('../../../../Logger')('ResultPacket');

class ResultPacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('game', 'result');
  }

  async handle (connection, packet) {
    const player = await connection.getPlayer();
    const gamePlayer = await player.getGamePlayer();
    const game = await player.getGame();

    const result = packet.args.slice(2);

    log.debug(`Received turn result from player ${player.toColorString()}: ${result}`);

    this.server.gameHandler.getTurn(game.id).addResult(gamePlayer.id, result);

    new ResultReceivedEvent(this.server, await player.getGame()).fire();
  }
}

module.exports = ResultPacket;
