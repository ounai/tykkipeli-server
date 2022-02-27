'use strict';

const chalk = require('chalk');

const Event = require('../Event');
const Player = require('../../db/models/Player');
const JoinLobbyEvent = require('./JoinLobbyEvent');
const Connection = require('../../net/Connection');
const DeleteGameEvent = require('../game/DeleteGameEvent');

const log = require('../../Logger')('PartGameLobbyEvent');

class PartGameLobbyEvent extends Event {
  async handle (server, connection, player) {
    if (!server) throw new Error(`Invalid server ${server}`);
    if (!(connection instanceof Connection)) throw new Error(`Invalid connection ${connection}`);
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);

    const game = await player.getGame();

    if (!game) throw new Error('Player\'s game not found');

    log.debug('Player leaving game lobby', chalk.magenta(game.toString()));

    // Delete game player
    await (await player.getGamePlayer()).destroy();

    const playerCount = await game.getPlayerCount();

    if (playerCount === 0) {
      log.debug(
        chalk.magenta(player.toString()),
        'is the last player, deleting game',
        chalk.magenta(game.toString())
      );

      new DeleteGameEvent(server, game).fire();
    } else {
      log.debug(
        'Removing',
        chalk.magenta(player.toString()),
        'from game',
        chalk.magenta(game.toString())
      );

      const gamePlayers = await game.getGamePlayers();

      // Resuffle game player id's of remaining players
      for (let i = 0; i < gamePlayers.length; i++) {
        if (i !== gamePlayers[i].id) {
          gamePlayers[i].id = i;
          await gamePlayers[i].save();
        }
      }

      // TODO send updated player list to players in game lobby
      // TODO update lobby game listing
    }

    new JoinLobbyEvent(server, connection, player).fire();
  }
}

module.exports = PartGameLobbyEvent;
