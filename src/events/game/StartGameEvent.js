'use strict';

const Event = require('../Event');
const Game = require('../../db/models/Game');

const log = require('../../Logger')('StartGameEvent');

class StartGameEvent extends Event {
  async handle (server, game) {
    if (!(game instanceof Game)) throw new Error(`Invalid game ${game}`);

    log.info('Starting game', game.toColorString());

    game.hasStarted = true;
    await game.save();

    // TODO a lot of things
  }
}

module.exports = StartGameEvent;
