'use strict';

const chalk = require('chalk');

const Event = require('../Event');
const Broadcast = require('../../net/Broadcast');
const GameListRemovePacket = require('../../net/packets/out/lobby/GameListRemovePacket');
const Player = require('../../db/models/Player');

const log = require('../../Logger')('DeleteGameEvent');

class DeleteGameEvent extends Event {
  async handle (server, game) {
    log.debug('Deleting game', chalk.magenta(game.toString()));

    const playersInLobby = await Player.findByGameState('LOBBY');
    const removeGamePacket = new GameListRemovePacket(game);

    new Broadcast(playersInLobby, removeGamePacket, server).writeAll();

    await game.destroy();

    log.debug(`Game ${chalk.magenta(game.toString())} deleted`);
  }
}

module.exports = DeleteGameEvent;
