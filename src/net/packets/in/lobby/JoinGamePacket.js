'use strict';

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Broadcast = require('../../../Broadcast');
const PartReason = require('../../../../lobby/PartReason');
const JoinErrorType = require('../../../../lobby/JoinErrorType');

const GameListUpdatedEvent = require('../../../../events/lobby/GameListUpdatedEvent');
const StartGameEvent = require('../../../../events/game/StartGameEvent');

const PartPacket = require('../../out/lobby/PartPacket');
const StatusPacket = require('../../out/StatusPacket');
const GameInfoPacket = require('../../out/game/GameInfoPacket');
const OwnInfoPacket = require('../../out/game/OwnInfoPacket');
const PlayersPacket = require('../../out/game/PlayersPacket');
const JoinPacket = require('../../out/game/JoinPacket');
const ReadyToStartPacket = require('../../out/game/ReadyToStartPacket');

const Game = require('../../../../db/models/Game');
const GamePlayer = require('../../../../db/models/GamePlayer');
const GameState = require('../../../../db/models/GameState');

const log = require('../../../../Logger')('JoinGamePacket');

class JoinGamePacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('lobby', 'join');
  }

  #writeJoinError (connection, joinErrorType) {
    if (!(joinErrorType instanceof JoinErrorType)) {
      throw new Error(`Invalid join error type ${joinErrorType}`);
    }

    new StatusPacket('lobby', joinErrorType.valueOf()).write(connection);
  }

  // Returns true if everything ok, false if incorrect password was given
  #validatePassword (connection, player, game, packet) {
    if (game.password === null) {
      // No password needed
      return true;
    }

    const password = packet.getString(3);

    if (game.password === password) {
      log.debug('Player', player.toColorString(), 'gave correct password!');

      return true;
    } else {
      log.debug('Player', player.toColorString(), `gave wrong password "${password}"`);

      this.#writeJoinError(connection, JoinErrorType.INCORRECT_PASSWORD);

      return false;
    }
  }

  async handle (connection, packet) {
    const player = await connection.getPlayer();
    const gameId = packet.getNumber(2);

    log.debug('Player', player.toColorString(), 'wants to join game', gameId);

    const game = await Game.findById(gameId);

    if (!game) throw new Error(`Invalid game id ${gameId}`);

    if (!this.#validatePassword(connection, player, game, packet)) {
      return;
    }

    const otherGamePlayers = await game.getPlayers();

    if (game.hasStarted || otherGamePlayers.length >= game.maxPlayers) {
      log.debug('Too late for player', player.toColorString(), 'to join, the game has already started');

      return this.#writeJoinError(connection, JoinErrorType.GAME_STARTED);
    }

    const gamePlayer = await GamePlayer.create({
      id: otherGamePlayers.length,
      GameId: game.id,
      PlayerId: player.id
    });

    await player.setGameState(await GameState.findByName('GAME_LOBBY'));

    await new StatusPacket('game').write(connection);
    await new GameInfoPacket(game).write(connection);
    await new PlayersPacket(otherGamePlayers).write(connection);
    await new OwnInfoPacket(player, gamePlayer).write(connection);

    // Send ready to start packets
    for (const otherPlayer of otherGamePlayers) {
      otherPlayer.getGamePlayer().then(otherGamePlayer => (
        otherGamePlayer.isReadyToStart && new ReadyToStartPacket(otherGamePlayer).write(connection)
      ));
    }

    const playersInLobby = await player.findOthersByGameState('LOBBY');

    new Broadcast(playersInLobby, new PartPacket(player, PartReason.JOINED_GAME, game.name), this.server).writeAll();
    new Broadcast(otherGamePlayers, new JoinPacket(player), this.server).writeAll();

    if (game.maxPlayers === await game.getPlayerCount()) {
      log.debug('Game', game.toColorString(), 'is at max players, time to start it!');

      new StartGameEvent(this.server, game).fire();

      // TODO remove listing from lobby
    } else {
      new GameListUpdatedEvent(player, this.server).fire();
    }
  }
}

module.exports = JoinGamePacket;
