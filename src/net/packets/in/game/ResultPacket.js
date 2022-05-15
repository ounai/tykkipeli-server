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

  async handle (connection) {
    const player = await connection.getPlayer();
    const gamePlayer = await player.getGamePlayer();

    log.debug('Received turn results from player', player.toColorString());

    gamePlayer.turnResultsReceived = true;
    await gamePlayer.save();

    // TODO: make sure there is no race condition here
    // new ResultReceivedEvent(this.server, await player.getGame()).fire();
  }
}

module.exports = ResultPacket;
