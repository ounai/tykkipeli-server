'use strict';

const chalk = require('chalk');

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Broadcast = require('../../../Broadcast');
const PartReason = require('../../../../lobby/PartReason');

const PartPacket = require('../../out/lobby/PartPacket');
const StatusPacket = require('../../out/StatusPacket');
const GameInfoPacket = require('../../out/game/GameInfoPacket');
const OwnInfoPacket = require('../../out/game/OwnInfoPacket');
const PlayersPacket = require('../../out/game/PlayersPacket');
const JoinPacket = require('../../out/game/JoinPacket');

const Game = require('../../../../db/models/Game');
const GamePlayer = require('../../../../db/models/GamePlayer');
const GameState = require('../../../../db/models/GameState');

const log = require('../../../../Logger')('JoinGamePacket');

class JoinGamePacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('lobby', 'join');
  }

  async handle (connection, packet) {
    const player = await connection.getPlayer();
    const gameId = packet.getNumber(2);

    log.debug('Player', chalk.magenta(player.toString()), 'wants to join game', gameId);

    const game = await Game.findById(gameId);

    if (!game) throw new Error(`Invalid game id ${gameId}`);

    const otherGamePlayers = await game.getPlayers();

    // TODO validate password
    // TODO handle these more gracefully
    if (game.hasStarted) throw new Error('Cannot join, game has already started!');
    if (otherGamePlayers.length >= game.maxPlayers) throw new Error('Cannot join, game full!');

    const gamePlayer = await GamePlayer.create({
      id: otherGamePlayers.length,
      GameId: game.id,
      PlayerId: player.id
    });

    await player.setGameState(await GameState.findByName('GAME_LOBBY'));

    new StatusPacket('game').write(connection);
    await (new GameInfoPacket(game).write(connection));
    new OwnInfoPacket(player, gamePlayer).write(connection);
    new PlayersPacket(otherGamePlayers).write(connection);

    const playersInLobby = await player.findOthersByGameState('LOBBY');

    new Broadcast(playersInLobby, new PartPacket(player, PartReason.JOINED_GAME, game.name), this.server).writeAll();
    new Broadcast(otherGamePlayers, new JoinPacket(player), this.server).writeAll();
  }
}

module.exports = JoinGamePacket;
