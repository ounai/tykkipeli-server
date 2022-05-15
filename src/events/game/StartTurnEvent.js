'use strict';

const Event = require('../Event');
const StartTurnPacket = require('../../net/packets/out/game/StartTurnPacket');

const log = require('../../Logger')('StartTurnEvent');

class StartTurnEvent extends Event {
  async handle (server, game) {
    log.debug('Starting next turn of game', game.toColorString());

    const wind = 0; // TODO wind should be generated according to WindMode

    for (const player of await game.getPlayers()) {
      const gamePlayer = await player.getGamePlayer();

      gamePlayer.turnResultsReceived = false;
      await gamePlayer.save();

      new StartTurnPacket(player, wind).write(server.connectionHandler.getPlayerConnection(player));
    }
  }
}

module.exports = StartTurnEvent;
