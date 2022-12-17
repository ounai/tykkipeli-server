'use strict';

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Game = require('../../../../db/models/Game');

const PartGameLobbyEvent = require('../../../../events/player/PartGameLobbyEvent');
const PartGameEvent = require('../../../../events/player/PartGameEvent');
const JoinLobbyEvent = require('../../../../events/player/JoinLobbyEvent');

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

    log.debug('Player', player.toColorString(), 'is leaving game', game.toColorString());

    if (game.hasStarted) {
      await new PartGameEvent(this.server, player).fire();
    } else {
      await new PartGameLobbyEvent(this.server, player).fire();
    }

    new JoinLobbyEvent(this.server, connection, player, true).fire();
  }
}

module.exports = QuitPacket;
