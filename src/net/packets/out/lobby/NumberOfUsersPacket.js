'use strict';

const OutPacket = require('../OutPacket');

class NumberOfUsersPacket extends OutPacket {
  constructor (player) {
    super(async () => {
      const inLobbyCount = await player.countOthersByGameState('LOBBY');
      const inGameCount = await player.countOthersByGameState('GAME_LOBBY', 'GAME');

      return ['lobby', 'numberofusers', inLobbyCount, inGameCount];
    });
  }
}

module.exports = NumberOfUsersPacket;
