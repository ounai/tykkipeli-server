'use strict';

const chalk = require('chalk');

const Connection = require('../../net/Connection');
const PartReason = require('../../lobby/PartReason');
const Broadcast = require('../../net/Broadcast');

const Player = require('../../db/models/Player');
const GamePlayer = require('../../db/models/GamePlayer');

const PartPacket = require('../../net/packets/out/game/PartPacket');
const PlayersPacket = require('../../net/packets/out/game/PlayersPacket');
const GameInfoPacket = require('../../net/packets/out/game/GameInfoPacket');

const Event = require('../Event');
const JoinLobbyEvent = require('./JoinLobbyEvent');
const DeleteGameEvent = require('../game/DeleteGameEvent');
const PlayerCountChangeEvent = require('../gameLobby/PlayerCountChangeEvent');

const log = require('../../Logger')('PartGameLobbyEvent');

class PartGameLobbyEvent extends Event {
  async #lastPlayerDeleteGame (server, player, game) {
    log.debug(
      chalk.magenta(player.toString()),
      'is the last player, deleting game',
      chalk.magenta(game.toString())
    );

    new DeleteGameEvent(server, game).fire();
  }

  async #reorderPlayerIds (gamePlayers) {
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

    log.debug('Player leaving game lobby', chalk.magenta(game.toString()));

    const gamePlayer = await player.getGamePlayer();
    await gamePlayer.destroy();

    // Player count after discarding the parting player
    const playerCount = await game.getPlayerCount();

    if (playerCount === 0) {
      this.#lastPlayerDeleteGame(server, player, game);
    } else {
      log.debug('Removing', chalk.magenta(player.toString()), 'from game', chalk.magenta(game.toString()));

      const gamePlayers = await game.getGamePlayers();

      this.#reorderPlayerIds(gamePlayers);

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
      await new Broadcast(gamePlayers, gameInfoPacket, server).writeAll();
      new Broadcast(gamePlayers, updatedPlayersPacket, server).writeAll();

      // TODO update lobby game listing
    }

    new JoinLobbyEvent(server, connection, player).fire();
    new PlayerCountChangeEvent(game).fire();
  }
}

module.exports = PartGameLobbyEvent;
