'use strict';

const PartReason = require('../../lobby/PartReason');
const Broadcast = require('../../net/Broadcast');

const PartPacket = require('../../net/packets/out/game/PartPacket');

const Event = require('../Event');
const Player = require('../../db/models/Player');
const DeleteGameEvent = require('../game/DeleteGameEvent');
const PlayerCountChangeEvent = require('../gameLobby/PlayerCountChangeEvent');
const GameListUpdatedEvent = require('../lobby/GameListUpdatedEvent');
const EndGameEvent = require('../game/EndGameEvent');

const log = require('../../Logger')('PartGameEvent');

class PartGameEvent extends Event {
  async handle (server, player, reason = PartReason.USER_LEFT) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);
    if (!server) throw new Error(`Invalid server ${server}`);

    const game = await player.getGame();

    if (!game) throw new Error('Player\'s game not found');

    log.debug('Player leaving game', game.toColorString());

    const gamePlayer = await player.getGamePlayer();
    await gamePlayer.destroy();

    // Player count after discarding the parting player
    const playerCount = await game.getPlayerCount();

    if (playerCount === 0) {
      log.debug(player.toColorString(), 'is the last player, deleting game', game.toColorString());

      await new DeleteGameEvent(server, game, player).fire();
    } else {
      log.debug('Removing', player.toColorString(), 'from game', game.toColorString());

      const gamePlayers = await game.getGamePlayers();

      const partPacket = new PartPacket(gamePlayer, reason);

      // Send parting packet to others in game
      new Broadcast(gamePlayers, partPacket, server).writeAll();

      new PlayerCountChangeEvent(game).fire();
      new GameListUpdatedEvent(server, player).fire();

      if (playerCount === 1) {
        log.debug('Only one player left, ending game', game.toColorString());

        new EndGameEvent(server, game).fire();
      }
    }
  }
}

module.exports = PartGameEvent;
