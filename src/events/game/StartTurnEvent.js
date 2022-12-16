'use strict';

const Event = require('../Event');
const StartTurnPacket = require('../../net/packets/out/game/StartTurnPacket');

const log = require('../../Logger')('StartTurnEvent');

class StartTurnEvent extends Event {
  #health = null;

  #isHealthy (gamePlayerId) {
    return this.#health === null || this.#health[gamePlayerId] > 0;
  }

  async handle (server, game) {
    log.debug('Starting next turn of game', game.toColorString());

    if (server.gameHandler.turnExists(game.id)) {
      const lastTurnResult = server.gameHandler.getTurn(game.id).result;

      if (lastTurnResult) {
        const health = lastTurnResult.slice(0, await game.getPlayerCount());

        this.#health = health;
      }
    }

    server.gameHandler.resetTurn(game.id);

    const wind = 0; // TODO wind should be generated according to WindMode

    for (const player of await game.getPlayers()) {
      const gamePlayer = await player.getGamePlayer();

      if (this.#isHealthy(gamePlayer.id)) {
        new StartTurnPacket(player, wind).write(server.connectionHandler.getPlayerConnection(player));
      }
    }
  }
}

module.exports = StartTurnEvent;
