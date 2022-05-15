'use strict';

const OutPacket = require('../OutPacket');
const Player = require('../../../../db/models/Player');

class StartTurnPacket extends OutPacket {
  constructor (player, wind) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);
    if (typeof wind !== 'number') throw new Error(`Invalid wind amount ${wind}`);

    super(async () => {
      const speedFactor = 500; // TODO make configurable
      const damageFactor = 1000; // TODO ^
      const unknownFactor = 1000; // TODO figure this out

      const gamePlayer = await player.getGamePlayer();

      return [
        'game',
        'startturn',
        speedFactor,
        wind,
        damageFactor,
        unknownFactor,
        gamePlayer.id,
        await gamePlayer.getAmmoString()
      ];
    });
  }
}

module.exports = StartTurnPacket;
