'use strict';

const OutPacket = require('../OutPacket');
const Player = require('../../../../db/models/Player');

class NumberOfUsersPacket extends OutPacket {
  async #getArgs() {
    const inLobbyCount = await Player.countByGameState('LOBBY');
    const inGameCount = await Player.countByGameState('GAME_LOBBY', 'GAME');

    return ['lobby', 'numberofusers', inLobbyCount, inGameCount];
  }

  constructor() {
    super();
    super.asyncArgs(this.#getArgs);
  }
}

module.exports = NumberOfUsersPacket;

