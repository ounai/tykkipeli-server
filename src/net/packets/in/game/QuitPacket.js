'use strict';

const chalk = require('chalk');

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Game = require('../../../../db/models/Game');
const PartGameLobbyEvent = require('../../../../events/player/PartGameLobbyEvent');

const log = require('../../../../Logger')('QuitPacket');

class QuitPacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('game', 'quit');
  }

  async handle (connection) {
    const player = await connection.getPlayer();
    const game = await player.getGame();

    if (!(game instanceof Game)) {
      throw new Error(`Invalid game ${game}`);
    }

    log.debug('Player', chalk.magenta(player.toString()), 'is leaving game', chalk.magenta(game.toString()));

    new PartGameLobbyEvent(this.server, connection, player).fire();
  }
}

module.exports = QuitPacket;
