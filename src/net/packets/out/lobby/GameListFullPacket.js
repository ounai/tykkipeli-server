'use strict';

const OutPacket = require('../OutPacket');
const Game = require('../../../../db/models/Game');

class GameListFullPacket extends OutPacket {
  constructor () {
    super(async () => {
      const games = await Game.findAll();
      const gameStrings = [];

      for (const game of games) {
        gameStrings.push(await game.getGameListItemString());
      }

      return ['lobby', 'gamelist', 'full', games.length, ...gameStrings];
    });
  }
}

module.exports = GameListFullPacket;
