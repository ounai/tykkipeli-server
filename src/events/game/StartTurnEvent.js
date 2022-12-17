'use strict';

const Utils = require('../../Utils');
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

    if (server.gameHandler.hasActiveTurn(game.id)) {
      const lastTurnResult = server.gameHandler.getTurn(game.id).result;

      if (lastTurnResult) {
        const health = lastTurnResult.slice(0, game.startingPlayers);

        this.#health = health;
      }
    }

    server.gameHandler.resetTurn(game.id);

    const windModeName = (await game.getWindMode()).name;

    let wind = 0;

    // TODO: use probabilities from a bell curve for both with range [-100, 100]
    if (windModeName === 'NORMAL') {
      // TODO: keep same wind for full round
      wind = Utils.getRandomInt(50) - 25;
    } else if (windModeName === 'RANDOM') {
      wind = Utils.getRandomInt(100) - 50;
    }

    log.debug('Generated wind of', wind, 'by mode', windModeName);

    for (const player of await game.getPlayers()) {
      const gamePlayer = await player.getGamePlayer();

      if (this.#isHealthy(gamePlayer.id)) {
        new StartTurnPacket(player, wind).write(server.connectionHandler.getPlayerConnection(player));
      }
    }
  }
}

module.exports = StartTurnEvent;
