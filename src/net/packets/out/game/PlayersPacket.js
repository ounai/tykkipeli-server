'use strict';

const OutPacket = require('../OutPacket');

class PlayersPacket extends OutPacket {
  async #getArgs (players) {
    const playerInfoStrings = [];

    for (const player of players) {
      playerInfoStrings.push(await player.getGameInfoString());
    }

    return ['game', 'players', ...playerInfoStrings];
  }

  constructor (players) {
    super();
    super.asyncArgs(this.#getArgs.bind(this, players));
  }
}

module.exports = PlayersPacket;
