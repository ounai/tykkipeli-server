'use strict';

const chalk = require('chalk');

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Broadcast = require('../../../Broadcast');

const StatusPacket = require('../../out/StatusPacket');
const GameListAddPacket = require('../../out/lobby/GameListAddPacket');
const OwnInfoPacket = require('../../out/game/OwnInfoPacket');
const GameInfoPacket = require('../../out/game/GameInfoPacket');
const PartPacket = require('../../out/lobby/PartPacket');

const GameState = require('../../../../db/models/GameState');
const Game = require('../../../../db/models/Game');
const GamePlayer = require('../../../../db/models/GamePlayer');
const PlayingOrderMode = require('../../../../db/models/PlayingOrderMode');
const WeaponAddingMode = require('../../../../db/models/WeaponAddingMode');
const WindMode = require('../../../../db/models/WindMode');
const ScoringMode = require('../../../../db/models/ScoringMode');

const log = require('../../../../Logger')('CreatePacket');

class CreatePacket extends InPacket {
  type = PacketType.DATA;

  match(packet) {
    return packet.startsWith('lobby', 'create');
  }

  async handle(connection, packet) {
    const player = await connection.getPlayer();

    log.debug('Player', chalk.magenta(player.toString()), 'is creating a new game');

    let gameName = packet.getString(2);
    if (gameName === '-') gameName = `${player.username}'s game`;

    let password = packet.getString(3);
    if (password === '-') password = null;

    const registeredPlayersOnly = (packet.getNumber(4) !== 0);
    const dudsEnabled = (packet.getNumber(11) !== 0);

    const maxPlayers = packet.getNumber(5);
    if (maxPlayers < 0 || maxPlayers > 8) throw new Error(`Invalid max players ${maxPlayers}`);

    const roundCount = packet.getNumber(6);
    if (roundCount < 0 || roundCount > 20) throw new Error(`Invalid round count ${roundCount}`);

    const thinkingTime = packet.getNumber(9);
    if (thinkingTime < 0) throw new Error(`Invalid thinking time ${thinkingTime}`);

    const playingOrderMode = await PlayingOrderMode.findById(packet.getNumber(8));
    if (!playingOrderMode) throw new Error(`Invalid playing order mode ${playingOrderMode}`);

    const weaponAddingMode = await WeaponAddingMode.findById(packet.getNumber(7));
    if (!weaponAddingMode) throw new Error(`Invalid weapon adding mode ${weaponAddingMode}`);

    const windMode = await WindMode.findById(packet.getNumber(10));
    if (!windMode) throw new Error(`Invalid wind mode ${windMode}`);

    const scoringMode = await ScoringMode.findById(packet.getNumber(12));
    if (!scoringMode) throw new Error(`Invalid scoring mode ${scoringMode}`);

    // TODO
    log.debug('gameName', gameName);
    log.debug('password', password);
    log.debug('registeredPlayersOnly', registeredPlayersOnly);
    log.debug('maxPlayers', maxPlayers);
    log.debug('roundCount', roundCount);
    log.debug('weaponAddingMode', weaponAddingMode.name);
    log.debug('playingOrderMode', playingOrderMode.name);
    log.debug('thinkingTime', thinkingTime);
    log.debug('windMode', windMode.name);
    log.debug('dudsEnabled', dudsEnabled);
    log.debug('scoringMode', scoringMode.name);

    const game = await Game.create({
      name: gameName,
      password,
      registeredPlayersOnly,
      maxPlayers,
      roundCount,
      thinkingTime,
      dudsEnabled
    });

    await game.setWeaponAddingMode(weaponAddingMode);
    await game.setPlayingOrderMode(playingOrderMode);
    await game.setWindMode(windMode);
    await game.setScoringMode(scoringMode);

    log.debug('Game created:', game); // TODO

    log.info(
      'New game',
      chalk.cyan(gameName) + (password !== null ? ` (password ${chalk.cyan(password)})` : ''),
      'created by',
      chalk.magenta(player.username)
    );

    const gamePlayer = await GamePlayer.create({
      id: 0,
      GameId: game.id,
      PlayerId: player.id
    });

    log.debug('GamePlayer created:', gamePlayer.dataValues); // TODO

    await player.setGameState(await GameState.findByName('GAME_LOBBY'));

    new StatusPacket('game').write(connection);
    await (new GameInfoPacket(game).write(connection));
    new OwnInfoPacket(player, gamePlayer).write(connection);

    const playersInLobby = await player.findOthersByGameState('LOBBY');

    new Broadcast(playersInLobby, new GameListAddPacket(game), this.server).writeAll();
    new Broadcast(playersInLobby, new PartPacket(player, 4, game.name), this.server).writeAll();
  }
}

module.exports = CreatePacket;

