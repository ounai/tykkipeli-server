'use strict';

const chalk = require('chalk');

const Event = require('../Event');
const Player = require('../../db/models/Player');

const log = require('../../Logger')('PartGameEvent');

class PartGameEvent extends Event {
  async handle (server, player) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);
    if (!server) throw new Error(`Invalid server ${server}`);

    const game = await player.getGame();

    if (!game) throw new Error('Player\'s game not found');

    log.debug('Player leaving game', chalk.magenta(game.toString()));

    // TODO
  }
}

module.exports = PartGameEvent;
