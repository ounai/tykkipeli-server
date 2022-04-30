'use strict';

const chalk = require('chalk');

const Event = require('../Event');
const Player = require('../../db/models/Player');
const PartPacket = require('../../net/packets/out/lobby/PartPacket');
const Broadcast = require('../../net/Broadcast');
const PartReason = require('../../lobby/PartReason');

const log = require('../../Logger')('PartLobbyEvent');

class PartLobbyEvent extends Event {
  async handle (server, player, reason = PartReason.USER_LEFT) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);
    if (!server) throw new Error(`Invalid server ${server}`);
    if (!(reason instanceof PartReason)) throw new Error(`Invalid part reason ${reason}`);

    log.debug(chalk.magenta(player.toString()), 'parting lobby:', chalk.magenta(reason.toString()));

    const otherPlayers = await player.findOthersByGameState('LOBBY');
    const partPacket = new PartPacket(player, reason);

    // Send parting packet to others in lobby
    new Broadcast(otherPlayers, partPacket, server).writeAll();
  }
}

module.exports = PartLobbyEvent;
