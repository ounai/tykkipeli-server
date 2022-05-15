'use strict';

const OutPacket = require('../OutPacket');

const Player = require('../../../../db/models/Player');
const GamePlayer = require('../../../../db/models/GamePlayer');

class OwnInfoPacket extends OutPacket {
  constructor (player, gamePlayer) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);
    if (!(gamePlayer instanceof GamePlayer)) throw new Error(`Invalid game player ${gamePlayer}`);

    super(
      'game',
      'owninfo',
      gamePlayer.id,
      player.username,
      player.clanName ?? '-',
      '-' // TODO figure out what this is
    );
  }
}

module.exports = OwnInfoPacket;
