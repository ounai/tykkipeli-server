'use strict';

const chalk = require('chalk');

const Event = require('../Event');
const Player = require('../../db/models/Player');
const Broadcast = require('../../net/Broadcast');
const GameListRemovePacket = require('../../net/packets/out/lobby/GameListRemovePacket');
const JoinLobbyEvent = require('./JoinLobbyEvent');
const Connection = require('../../net/Connection');

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
    const gameString = game.toString();

    if (playerCount === 1) {
      log.debug(
        chalk.magenta(player.toString()),
        'is the last player, deleting game',
        chalk.magenta(gameString)
      );

      const playersInLobby = await player.findOthersByGameState('LOBBY');
      const removeGamePacket = new GameListRemovePacket(game);

      new Broadcast(playersInLobby, removeGamePacket, server).writeAll();

      // Also destroys linked GamePlayer
      await game.destroy();

      log.debug(`Game ${chalk.magenta(gameString)} deleted`);

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
