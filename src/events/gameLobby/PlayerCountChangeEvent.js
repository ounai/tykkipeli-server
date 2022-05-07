'use strict';

const Event = require('../Event');
const GamePlayer = require('../../db/models/GamePlayer');
const Game = require('../../db/models/Game');

const log = require('../../Logger')('PCountChangeEvent');

class PlayerCountChangeEvent extends Event {
  async handle (game) {
    if (!(game instanceof Game)) {
      throw new Error(`Invalid game ${game}`);
    }

    const [readyToStartsUpdated] = await GamePlayer.update({
      readyToStart: false
    }, {
      where: {
        GameId: game.id
      }
    });

    if (readyToStartsUpdated > 0) {
      log.debug('Updated', readyToStartsUpdated, 'players\' ready to start values to false');
    }
  }
}

module.exports = PlayerCountChangeEvent;
