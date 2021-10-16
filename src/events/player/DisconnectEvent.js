'use strict';

const chalk = require('chalk');

const Event = require('../Event');
const Player = require('../../db/models/Player');
const PartLobbyEvent = require('./PartLobbyEvent');
const PartGameLobbyEvent = require('./PartGameLobbyEvent');
const PartGameEvent = require('./PartGameEvent');

const log = require('../../Logger')('DisconnectEvent');

class DisconnectEvent extends Event {
  async handle (server, player) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);
    if (!server) throw new Error(`Invalid server ${server}`);

    const gameState = await player.getGameState();

    log.debug('Player', chalk.magenta(player.toString()), `disconnecting (state=${chalk.magenta(gameState.name)})`);

    if (gameState.name === 'LOBBY') new PartLobbyEvent(server, player).fire();
    else if (gameState.name === 'GAME_LOBBY') new PartGameLobbyEvent(server, player).fire();
    else if (gameState.name === 'GAME') new PartGameEvent(server, player).fire();

    await player.setConnected(false);

    log.info('Player', chalk.magenta(player.toString()), 'disconnected');
  }
}

module.exports = DisconnectEvent;
