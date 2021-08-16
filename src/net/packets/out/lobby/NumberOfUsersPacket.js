'use strict';

const OutPacket = require('../OutPacket');

class NumberOfUsersPacket extends OutPacket {
  async #getArgs(player) {
    const inLobbyCount = await player.countOthersByGameState('LOBBY');
    const inGameCount = await player.countOthersByGameState('GAME_LOBBY', 'GAME');

    return ['lobby', 'numberofusers', inLobbyCount, inGameCount];
  }

  constructor(player) {
    super();
    super.asyncArgs(this.#getArgs.bind(this, player));
  }
}

module.exports = NumberOfUsersPacket;

