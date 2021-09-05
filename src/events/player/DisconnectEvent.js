'use strict';

const chalk = require('chalk');

const Event = require('../Event');
const Broadcast = require('../../net/Broadcast');
const PartPacket = require('../../net/packets/out/lobby/PartPacket');
const Player = require('../../db/models/Player');
const PartReason = require('../../lobby/PartReason');

const log = require('../../Logger')('DisconnectEvent');

class DisconnectEvent extends Event {
  async handle(server, player) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);
    if (!server) throw new Error(`Invalid server ${server}`);

    const gameState = await player.getGameState();

    log.debug('Player', chalk.magenta(player.toString()), `disconnecting (state=${chalk.magenta(gameState.name)})`);

    if (gameState.name === 'LOBBY') {
      // Send parting packet to others in lobby

      const otherPlayers = await player.findOthersByGameState('LOBBY');
      const partPacket = new PartPacket(player, PartReason.USER_LEFT);

      new Broadcast(otherPlayers, partPacket, server).writeAll();
    } else if (gameState.name === 'GAME_LOBBY') {
      const game = await player.getGame();

      if (!game) throw new Error('Player\'s game not found');

      log.debug('Player leaving game lobby', chalk.magenta(game.toString()));

      const playerCount = await game.getPlayerCount();

      if (playerCount === 1) {
        log.debug(
          chalk.magenta(player.toString()),
          'is the last player, deleting game',
          chalk.magenta(game.toString())
        );

        // TODO last player, delete game
      } else {
        log.debug(
          'Removing',
          chalk.magenta(player.toString()),
          'from game',
          chalk.magenta(game.toString())
        );

        // TODO not last player, reshuffle player id's
      }
    } else if (gameState.name === 'GAME') {
      const game = await player.getGame();

      if (!game) throw new Error('Player\'s game not found');

      log.debug('Player leaving game', chalk.magenta(game.toString()));

      // TODO
    }

    await player.setConnected(false);

    log.info('Player', chalk.magenta(player.toString()), 'disconnected');
  }
}

module.exports = DisconnectEvent;

