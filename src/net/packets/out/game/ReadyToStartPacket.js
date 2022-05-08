'use strict';

const OutPacket = require('../OutPacket');
const GamePlayer = require('../../../../db/models/GamePlayer');

class ReadyToStartPacket extends OutPacket {
  constructor (gamePlayer) {
    if (!(gamePlayer instanceof GamePlayer)) {
      throw new Error(`Invalid game player ${gamePlayer}`);
    }

    super('game', 'readytostart', gamePlayer.id);
  }
}

module.exports = ReadyToStartPacket;
