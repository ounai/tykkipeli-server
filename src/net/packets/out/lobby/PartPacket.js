'use strict';

const OutPacket = require('../OutPacket');

const log = require('../../../../Logger')('PartPacket');

class PartPacket extends OutPacket {
  // TODO parting to create a game
  // TODO parting to join a game
  constructor(player, reasonCode) {
    /*
     * Reason codes:
     *  1: leaving because of free will
     *  2: leaving because of connection problems
     *  3: leaving to create a game
     *  4: leaving to join a game
     */

    // TODO enumerate reason
    if (typeof(reasonCode) !== 'number' || ![1, 2, 3, 4].includes(reasonCode)) {
      throw new Error(`Invalid reason code ${reasonCode}`);
    }

    log.debug(player.toString(), 'parting:', reasonCode);

    super('lobby', 'part', player.username, reasonCode);
  }
}

module.exports = PartPacket;

