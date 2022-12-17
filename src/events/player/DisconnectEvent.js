'use strict';

const chalk = require('chalk');

const Event = require('../Event');
const Connection = require('../../net/Connection');
const Player = require('../../db/models/Player');

const PartLobbyEvent = require('./PartLobbyEvent');
const PartGameLobbyEvent = require('./PartGameLobbyEvent');
const PartGameEvent = require('./PartGameEvent');

const log = require('../../Logger')('DisconnectEvent');

class DisconnectEvent extends Event {
  async handle (server, connection, player) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);
    if (!(connection instanceof Connection)) throw new Error(`Invalid connection ${connection}`);
    if (!server) throw new Error(`Invalid server ${server}`);

    const gameState = await player.getGameState();

    log.debug('Player', player.toColorString(), `disconnecting (state=${chalk.magenta(gameState.name)})`);

    if (gameState.name === 'LOBBY') new PartLobbyEvent(server, player).fire();
    else if (gameState.name === 'GAME_LOBBY') new PartGameLobbyEvent(server, player).fire();
    else if (gameState.name === 'GAME') new PartGameEvent(server, player).fire();

    await player.setConnected(false);

    log.info('Player', player.toColorString(), 'disconnected');
  }
}

module.exports = DisconnectEvent;
