'use strict';

const OutPacket = require('../OutPacket');

const log = require('../../../../Logger')('PartPacket');

class PartPacket extends OutPacket {
  // TODO parting to create a game
  // TODO parting to join a game
  constructor(player, reasonCode, gameName) {
    /*
     * Reason codes:
     *  1: leaving because of free will
     *  2: leaving because of connection problems
     *  4: leaving to create a game
     *  5: leaving to join a game
     */

    // TODO enumerate reason
    if (typeof(reasonCode) !== 'number' || ![1, 2, 4, 5].includes(reasonCode)) {
      throw new Error(`Invalid reason code ${reasonCode}`);
    }

    log.debug(player.toString(), 'parting:', reasonCode);

    if ([1, 2].includes(reasonCode)) super('lobby', 'part', player.username, reasonCode);
    else {
      if (typeof(gameName) !== 'string' || gameName.length === 0) {
        throw new Error(`Invalid game name ${gameName}`);
      }

      super('lobby', 'part', player.username, reasonCode, gameName);
    }
  }
}

module.exports = PartPacket;

