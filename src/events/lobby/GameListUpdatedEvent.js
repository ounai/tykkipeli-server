'use strict';

const Event = require('../Event');
const Broadcast = require('../../net/Broadcast');
const GameListFullPacket = require('../../net/packets/out/lobby/GameListFullPacket');
const Player = require('../../db/models/Player');

class GameListUpdatedEvent extends Event {
  async handle (server, excludedPlayer = null) {
    // Send updated full game list to all or other players in lobby
    const lobbyPlayers = excludedPlayer
      ? await excludedPlayer.findOthersByGameState('LOBBY')
      : await Player.findByGameState('LOBBY');

    new Broadcast(lobbyPlayers, new GameListFullPacket(), server).writeAll();
  }
}

module.exports = GameListUpdatedEvent;
