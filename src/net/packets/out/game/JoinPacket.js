'use strict';

const OutPacket = require('../OutPacket');

class JoinPacket extends OutPacket {
  async #getArgs (player) {
    return [
      'game',
      'join',
      await player.getGameInfoString()
    ];
  }

  constructor (player) {
    super();
    super.asyncArgs(this.#getArgs.bind(this, player));
  }
}

module.exports = JoinPacket;
