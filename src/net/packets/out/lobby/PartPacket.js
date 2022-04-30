'use strict';

const OutPacket = require('../OutPacket');
const PartReason = require('../../../../lobby/PartReason');

class PartPacket extends OutPacket {
  constructor (player, reason, gameName) {
    if (!(reason instanceof PartReason)) {
      throw new Error(`Invalid part reason ${reason}`);
    }

    if (reason === PartReason.USER_LEFT || reason === PartReason.CONNECTION_PROBLEMS) {
      super('lobby', 'part', player.username, reason.valueOf());
    } else {
      if (typeof gameName !== 'string' || gameName.length === 0) {
        throw new Error(`Invalid game name ${gameName}`);
      }

      super('lobby', 'part', player.username, reason.valueOf(), gameName);
    }
  }
}

module.exports = PartPacket;
