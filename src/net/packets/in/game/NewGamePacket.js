'use strict';

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Broadcast = require('../../../Broadcast');
const WantNewGamePacket = require('../../out/game/WantNewGamePacket');
const StartGameEvent = require('../../../../events/game/StartGameEvent');

const log = require('../../../../Logger')('NewGamePacket');

class NewGamePacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('game', 'newgame');
  }

  async handle (connection, packet) {
    const player = await connection.getPlayer();

    log.debug('Player', player.toColorString(), 'wants a new game');

    const gamePlayer = await player.getGamePlayer();
    gamePlayer.isReadyToStart = true;
    await gamePlayer.save();

    const game = await player.getGame();
    const otherGamePlayers = await game.getPlayers();

    new Broadcast(otherGamePlayers, new WantNewGamePacket(gamePlayer), this.server).writeAll();

    if (await game.isReadyToStart()) {
      log.debug('Game', game.toColorString(), 'is ready to restart!');

      new StartGameEvent(this.server, game, true).fire();
    } else {
      log.debug('Game', game.toColorString(), 'is not yet ready to restart');
    }
  }
}

module.exports = NewGamePacket;
