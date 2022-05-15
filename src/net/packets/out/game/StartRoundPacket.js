'use strict';

const OutPacket = require('../OutPacket');

class StartRoundPacket extends OutPacket {
  // TODO: Figure out what unknownBoolean does
  //       It appears to control the game terrain in some way
  //       But only when mapSeed % 99 == 1 (?)
  constructor (mapSeed, unknownBoolean = false) {
    if (typeof mapSeed !== 'number') {
      throw new Error(`Invalid map seed ${mapSeed}`);
    }

    if (typeof unknownBoolean !== 'boolean') {
      throw new Error(`Invalid "unknown boolean" (:D) ${unknownBoolean}`);
    }

    super('game', 'startround', mapSeed, unknownBoolean ? 't' : 'f');
  }
}

module.exports = StartRoundPacket;
