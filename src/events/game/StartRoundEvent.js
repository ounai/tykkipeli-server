'use strict';

const config = require('../../config');

const Event = require('../Event');
const StartTurnEvent = require('./StartTurnEvent');
const Broadcast = require('../../net/Broadcast');
const StartRoundPacket = require('../../net/packets/out/game/StartRoundPacket');
const EndGameEvent = require('../game/EndGameEvent');

const Game = require('../../db/models/Game');
const Ammo = require('../../db/models/Ammo');

const log = require('../../Logger')('StartRoundEvent');

class StartRoundEvent extends Event {
  async #incrementAmmo (gameId, slotId, count) {
    await Ammo.increment('count', {
      by: count,
      where: {
        slotId,
        GameId: gameId
      }
    });
  }

  async #setAmmo (gameId, slotId, count) {
    await Ammo.update({
      count
    }, {
      where: {
        slotId,
        GameId: gameId
      }
    });
  }

  async #addAmmo (game, roundNumber, weaponAddingModeName) {
    log.debug(
      'Adding ammo to game',
      game.toColorString(),
      'round',
      roundNumber,
      'with weapon adding mode',
      weaponAddingModeName
    );

    if (weaponAddingModeName === 'INCREASING') {
      // Give ammo for current round
      const roundAmmo = config.game.roundAmmo[roundNumber - 1];

      log.debug('Increasing ammo in game', game.toColorString(), 'by', roundAmmo);

      for (let slotId = 0; slotId < 18; slotId++) {
        await this.#incrementAmmo(game.id, slotId, roundAmmo[slotId]);
      }
    } else if (weaponAddingModeName === 'CONSTANT') {
      // Set ammo for current round + first round ammo (if it's not the first round)
      const firstRoundAmmo = config.game.roundAmmo[0];
      const roundAmmo = config.game.roundAmmo[roundNumber - 1];

      for (let slotId = 0; slotId < 18; slotId++) {
        const totalAmmo = roundAmmo[slotId] + (roundNumber !== 0 ? firstRoundAmmo[slotId] : 0);

        await this.#setAmmo(game.id, slotId, totalAmmo);
      }
    } else if (weaponAddingModeName === 'DECREASING' && roundNumber === 1) {
      log.debug('Adding decreasing ammo for', game.roundCount, 'rounds of game', game.toColorString());

      for (let roundNumber = 0; roundNumber < game.roundCount; roundNumber++) {
        log.debug('Adding decreasing ammo for round', roundNumber + 1);

        const roundAmmo = config.game.roundAmmo[roundNumber];

        for (let slotId = 0; slotId < 18; slotId++) {
          await this.#incrementAmmo(game.id, slotId, roundAmmo[slotId]);
        }
      }
    }
  }

  async handle (server, game) {
    if (!server) throw new Error(`Invalid server ${server}`);
    if (!(game instanceof Game)) throw new Error(`Invalid game ${game}`);

    if (await game.getPlayerCount() <= 1) {
      return new EndGameEvent(server, game).fire();
    }

    const round = await game.findCurrentRound();

    log.debug('Starting round', round.roundNumber, 'of game', game.toColorString(), 'with seed', round.mapSeed);

    await this.#addAmmo(game, round.roundNumber, (await game.getWeaponAddingMode()).name);

    server.gameHandler.resetTurn(game.id);

    new Broadcast(
      await game.getPlayers(),
      new StartRoundPacket(round.mapSeed),
      server
    ).writeAll();

    new StartTurnEvent(server, game).fire();

    round.startTime = new Date();
    await round.save();
  }
}

module.exports = StartRoundEvent;
