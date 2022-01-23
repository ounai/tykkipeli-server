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

    const playerCount = await game.getPlayerCount();

    if (playerCount === 1) {
      log.debug(
        chalk.magenta(player.toString()),
        'is the last player, deleting game',
        chalk.magenta(game.toString())
      );

      new DeleteGameEvent(server, game).fire();
      new JoinLobbyEvent(server, connection, player).fire();
    } else {
      log.debug(
        'Removing',
        chalk.magenta(player.toString()),
        'from game',
        chalk.magenta(game.toString())
      );

      // TODO not last player, reshuffle player id's
    }
  }
}

module.exports = PartGameLobbyEvent;
