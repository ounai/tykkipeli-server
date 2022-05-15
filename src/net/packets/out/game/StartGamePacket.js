'use strict';

const OutPacket = require('../OutPacket');

class StartGamePacket extends OutPacket {
  async #getPlayersGameInfoStrings (players) {
    const playersGameInfoStrings = [];

    for (const player of players) {
      playersGameInfoStrings.push(await player.getGameInfoString(false));
    }

    return playersGameInfoStrings;
  }

  constructor (game, player) {
    super(async () => {
      const gamePlayer = await player.getGamePlayer();
      const players = await game.getPlayers();

      return [
        'game',
        'startgame',
        gamePlayer.id,
        players.length,
        ...await this.#getPlayersGameInfoStrings(players)
      ];
    });
  }
}

module.exports = StartGamePacket;
