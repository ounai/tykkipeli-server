'use strict';

const Connection = require('../../net/Connection');
const PartReason = require('../../lobby/PartReason');
const Broadcast = require('../../net/Broadcast');

const Player = require('../../db/models/Player');
const GamePlayer = require('../../db/models/GamePlayer');

const PartPacket = require('../../net/packets/out/game/PartPacket');
const PlayersPacket = require('../../net/packets/out/game/PlayersPacket');
const GameInfoPacket = require('../../net/packets/out/game/GameInfoPacket');
const OwnInfoPacket = require('../../net/packets/out/game/OwnInfoPacket');

const Event = require('../Event');
const JoinLobbyEvent = require('./JoinLobbyEvent');
const DeleteGameEvent = require('../game/DeleteGameEvent');
const PlayerCountChangeEvent = require('../gameLobby/PlayerCountChangeEvent');
const GameListUpdatedEvent = require('../lobby/GameListUpdatedEvent');

const log = require('../../Logger')('PartGameLobbyEvent');

class PartGameLobbyEvent extends Event {
  async #lastPlayerDeleteGame (server, player, game) {
    log.debug(player.toColorString(), 'is the last player, deleting game', game.toColorString());

    await new DeleteGameEvent(server, game, player).fire();
  }

  async #reorderPlayerIds (gamePlayers, server) {
    for (let i = 0; i < gamePlayers.length; i++) {
      if (i !== gamePlayers[i].id) {
        log.debug('Reordering players, set id', gamePlayers[i].id, '->', i);

        gamePlayers[i].id = i;

        await GamePlayer.update({
          id: i
        }, {
          where: {
            id: gamePlayers[i].id
          }
        });

        const updatedGamePlayer = await GamePlayer.findByPk(i);
        const player = await updatedGamePlayer.getPlayer();
        const connection = server.connectionHandler.getPlayerConnection(player);

        await new OwnInfoPacket(player, updatedGamePlayer).write(connection);
      }
    }
  }

  async handle (server, connection, player, reason = PartReason.USER_LEFT) {
    if (!server) throw new Error(`Invalid server ${server}`);
    if (!(connection instanceof Connection)) throw new Error(`Invalid connection ${connection}`);
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);
    if (!(reason instanceof PartReason)) throw new Error(`Invalid part reason ${reason}`);

    const game = await player.getGame();

    if (!game) throw new Error('Player\'s game not found');

    log.debug('Player leaving game lobby', game.toColorString());

    const gamePlayer = await player.getGamePlayer();
    await gamePlayer.destroy();

    // Player count after discarding the parting player
    const playerCount = await game.getPlayerCount();

    if (playerCount === 0) {
      await this.#lastPlayerDeleteGame(server, player, game);
    } else {
      log.debug('Removing', player.toColorString(), 'from game', game.toColorString());

      const gamePlayers = await game.getGamePlayers();

      await this.#reorderPlayerIds(gamePlayers, server);

      const partPacket = new PartPacket(gamePlayer, reason);
      const gameInfoPacket = new GameInfoPacket(game);
      const updatedPlayersPacket = new PlayersPacket(await game.getPlayers());

      // Send parting packet to others in game lobby
      new Broadcast(gamePlayers, partPacket, server).writeAll();

      // Send updated players list to others in game lobby
      //
      // TODO I don't think this is correctly implemented
      //      Currently it sends and prints out full game info every time someone leaves
      //      There must be some way of sending only the new player count
      await new Broadcast(gamePlayers, gameInfoPacket, server).writeAll(); // Game info
      await new Broadcast(gamePlayers, updatedPlayersPacket, server).writeAll();

      new PlayerCountChangeEvent(game).fire();
      new GameListUpdatedEvent(server, player).fire();
    }

    new JoinLobbyEvent(server, connection, player, true).fire();
  }
}

module.exports = PartGameLobbyEvent;
