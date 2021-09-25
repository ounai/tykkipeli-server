'use strict';

const chalk = require('chalk');

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Game = require('../../../../db/models/Game');
const Broadcast = require('../../../Broadcast');
const GameListRemovePacket = require('../../out/lobby/GameListRemovePacket');

const log = require('../../../../Logger')('QuitPacket');

class QuitPacket extends InPacket {
  type = PacketType.DATA;

  match(packet) {
    return packet.startsWith('game', 'quit');
  }

  async handle(connection, packet) {
    const player = await connection.getPlayer();
    const game = await player.getGame();

    if (!(game instanceof Game)) {
      throw new Error(`Invalid game ${game}`);
    }

    log.debug('Player', chalk.magenta(player.toString()), 'is leaving game', chalk.magenta(game.toString()));

    if (await game.getPlayerCount() === 1) {
      const playersInLobby = await player.findOthersByGameState('LOBBY');

      const removeGamePacket = new GameListRemovePacket(game);

      new Broadcast(playersInLobby, removeGamePacket, this.server).writeAll();

      log.debug('Deleting game', chalk.magenta(game.toString()));

      await game.destroy();

      log.debug('Game deleted');
    } else {
      // TODO others in game -> reshuffle game players
    }
  }
}

module.exports = QuitPacket;

