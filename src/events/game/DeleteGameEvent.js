'use strict';

const Event = require('../Event');
const Broadcast = require('../../net/Broadcast');
const GameListRemovePacket = require('../../net/packets/out/lobby/GameListRemovePacket');
const Player = require('../../db/models/Player');
const Game = require('../../db/models/Game');

const log = require('../../Logger')('DeleteGameEvent');

class DeleteGameEvent extends Event {
  async handle (server, game, player) {
    if (!(game instanceof Game)) throw new Error(`Invalid game ${game}`);
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);

    log.debug('Deleting game', game.toColorString());

    const playersInLobby = await player.findOthersByGameState('LOBBY');
    const removeGamePacket = new GameListRemovePacket(game);

    await new Broadcast(playersInLobby, removeGamePacket, server).writeAll();

    await game.destroy();

    log.debug('Game', game.toColorString(), 'deleted');
  }
}

module.exports = DeleteGameEvent;
