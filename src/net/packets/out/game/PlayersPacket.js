'use strict';

const OutPacket = require('../OutPacket');

class PlayersPacket extends OutPacket {
  constructor (players) {
    super(async () => {
      const playerInfoStrings = [];

      for (const player of players) {
        playerInfoStrings.push(await player.getGameInfoString());
      }

      return ['game', 'players', ...playerInfoStrings];
    });
  }
}

module.exports = PlayersPacket;
