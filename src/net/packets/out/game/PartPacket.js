'use strict';

const OutPacket = require('../OutPacket');
const PartReason = require('../../../../lobby/PartReason');

class PartPacket extends OutPacket {
  constructor (gamePlayer, partReason) {
    if (!(partReason instanceof PartReason)) {
      throw new Error(`Invalid part reason ${partReason}`);
    }

    super('game', 'part', gamePlayer.id, partReason.valueOf());
  }
}

module.exports = PartPacket;
