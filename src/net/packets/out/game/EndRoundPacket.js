'use strict';

const OutPacket = require('../OutPacket');

class EndRoundPacket extends OutPacket {
  constructor (roundNumber, winnerGamePlayerId) {
    super('game', 'endround', roundNumber - 1, winnerGamePlayerId);
  }
}

module.exports = EndRoundPacket;
