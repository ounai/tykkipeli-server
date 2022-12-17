'use strict';

const Event = require('../Event');
const Utils = require('../../Utils');

const GameListUpdatedEvent = require('../lobby/GameListUpdatedEvent');
const StartRoundEvent = require('./StartRoundEvent');

const StartGamePacket = require('../../net/packets/out/game/StartGamePacket');

const Game = require('../../db/models/Game');
const GameState = require('../../db/models/GameState');
const Round = require('../../db/models/Round');
const Ammo = require('../../db/models/Ammo');

const log = require('../../Logger')('StartGameEvent');

class StartGameEvent extends Event {
  async #validateGame (game) {
    if (!(game instanceof Game)) {
      throw new Error(`Invalid game ${game}`);
    }

    if (game.hasStarted) {
      throw new Error(`Cannot start game ${game.id}, already started!`);
    }
  }

  async #updateGamePlayerReadyToStarts (gamePlayers) {
    log.debug('Setting ready to start to false for', gamePlayers.count, 'game players');

    for (const gamePlayer of gamePlayers) {
      gamePlayer.readyToStart = false;
      await gamePlayer.save();
    }
  }

  async #updatePlayerGameStates (players) {
    log.debug('Setting game state to GAME for', players.count, 'players');

    const newGameState = await GameState.findByName('GAME');

    for (const player of players) {
      await player.setGameState(newGameState);
    }
  }

  async #createRounds (game) {
    log.debug('Creating', game.roundCount, 'rounds for game', game.toColorString());

    // Map seeds are signed 64-bit ints
    // Lower values >0 seem to represent nicest looking maps
    const mapSeed = Utils.getRandomInt(1_000_000);

    for (let roundNumber = 1; roundNumber <= game.roundCount; roundNumber++) {
      await Round.create({
        GameId: game.id,
        roundNumber,
        mapSeed
      });
    }
  }

  async #createAmmo (game, players) {
    log.debug('Creating ammo for', players.length, 'players');

    for (const player of players) {
      const gamePlayer = await player.getGamePlayer();

      // 18 ammo slots in total
      for (let slotId = 0; slotId < 18; slotId++) {
        Ammo.create({
          GameId: game.id,
          slotId,
          GamePlayerId: gamePlayer.id,
          count: slotId // TODO
        });
      }
    }
  }

  async handle (server, game) {
    await this.#validateGame(game);

    const [affected] = await Game.update({
      hasStarted: true
    }, {
      where: {
        id: game.id,
        hasStarted: false
      }
    });

    if (affected === 1) {
      log.info('Starting game', game.toColorString());

      // Updates game listing for players in lobby
      new GameListUpdatedEvent(server).fire();

      const players = await game.getPlayers();

      await this.#updateGamePlayerReadyToStarts(await game.getGamePlayers());
      await this.#updatePlayerGameStates(players);
      await this.#createRounds(game);
      await this.#createAmmo(game, players);

      game.startingPlayers = players.length;
      game.currentRoundNumber = 1;
      await game.save();

      log.debug('Sending start game packets for game', game.toColorString());

      for (const player of players) {
        const connection = server.connectionHandler.getPlayerConnection(player);

        await new StartGamePacket(game, player).write(connection);
      }

      await new StartRoundEvent(server, game).fire();
    } else {
      log.debugError('Duplicate game start event skipped for game', game.toColorString());
    }
  }
}

module.exports = StartGameEvent;
