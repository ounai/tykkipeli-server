'use strict';

const Event = require('../Event');
const Broadcast = require('../../net/Broadcast');
const GameListFullPacket = require('../../net/packets/out/lobby/GameListFullPacket');

class GameListUpdatedEvent extends Event {
  async handle (player, server) {
    // Send updated full game list to other players in lobby

    const lobbyPlayers = await player.findOthersByGameState('LOBBY');

    new Broadcast(lobbyPlayers, new GameListFullPacket(), server).writeAll();
  }
}

module.exports = GameListUpdatedEvent;
