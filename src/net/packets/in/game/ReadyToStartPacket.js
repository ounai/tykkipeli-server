'use strict';

const chalk = require('chalk');

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Broadcast = require('../../../Broadcast');
const ReadyToStartOutPacket = require('../../out/game/ReadyToStartPacket');
const StartGameEvent = require('../../../../events/game/StartGameEvent');

const log = require('../../../../Logger')('ReadyToStartPacket');

class ReadyToStartPacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('game', 'readytostart');
  }

  async handle (connection, packet) {
    const player = await connection.getPlayer();

    log.debug('Player', chalk.magenta(player.toString()), 'is ready to start');

    const gamePlayer = await player.getGamePlayer();
    gamePlayer.isReadyToStart = true;
    await gamePlayer.save();

    const game = await player.getGame();
    const otherGamePlayers = await game.getPlayers();

    new Broadcast(otherGamePlayers, new ReadyToStartOutPacket(gamePlayer), this.server).writeAll();

    if (await game.isReadyToStart()) {
      log.debug('Game', game.toColorString(), 'is ready to start!');

      new StartGameEvent(this.server, game).fire();
    } else {
      log.debug('Game', game.toColorString(), 'is not yet ready to start');
    }
  }
}

module.exports = ReadyToStartPacket;
