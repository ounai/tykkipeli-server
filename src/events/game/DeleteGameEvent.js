'use strict';

const Event = require('../Event');
const Broadcast = require('../../net/Broadcast');
const GameListRemovePacket = require('../../net/packets/out/lobby/GameListRemovePacket');
const Player = require('../../db/models/Player');

const log = require('../../Logger')('DeleteGameEvent');

class DeleteGameEvent extends Event {
  async handle (server, game) {
    log.debug('Deleting game', game.toColorString());

    const playersInLobby = await Player.findByGameState('LOBBY');
    const removeGamePacket = new GameListRemovePacket(game);

    new Broadcast(playersInLobby, removeGamePacket, server).writeAll();

    await game.destroy();

    log.debug('Game', game.toColorString(), 'deleted');
  }
}

module.exports = DeleteGameEvent;
