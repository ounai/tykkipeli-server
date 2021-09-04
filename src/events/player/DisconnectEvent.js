'use strict';

const chalk = require('chalk');

const Event = require('../Event');
const Broadcast = require('../../net/Broadcast');
const PartPacket = require('../../net/packets/out/lobby/PartPacket');
const Player = require('../../db/models/Player');

const log = require('../../Logger')('DisconnectEvent');

class DisconnectEvent extends Event {
  async handle(server, player) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);
    if (!server) throw new Error(`Invalid server ${server}`);

    const gameState = await player.getGameState();

    if (gameState.name === 'LOBBY') {
      // Send parting packet to others in lobby

      const otherPlayers = await player.findOthersByGameState('LOBBY');
      const partPacket = new PartPacket(player, 1);

      new Broadcast(otherPlayers, partPacket, server).writeAll();
    } else if (gameState.name === 'GAME_LOBBY') {
      // TODO
    } else if (gameState.name === 'GAME') {
      // TODO
    }

    await player.setConnected(false);

    log.info('Player', chalk.magenta(player.toString()), 'disconnected');
  }
}

module.exports = DisconnectEvent;
