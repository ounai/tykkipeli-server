'use strict';

const OutPacket = require('../OutPacket');
const GamePlayer = require('../../../../db/models/GamePlayer');

class WantNewGamePacket extends OutPacket {
  constructor (gamePlayer) {
    if (!(gamePlayer instanceof GamePlayer)) {
      throw new Error(`Invalid game player ${gamePlayer}`);
    }

    super('game', 'wantnewgame', gamePlayer.id);
  }
}

module.exports = WantNewGamePacket;
