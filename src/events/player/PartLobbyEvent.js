'use strict';

const Event = require('../Event');
const Player = require('../../db/models/Player');
const PartPacket = require('../../net/packets/out/lobby/PartPacket');
const Broadcast = require('../../net/Broadcast');
const PartReason = require('../../lobby/PartReason');

class PartLobbyEvent extends Event {
  async handle (server, player) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);
    if (!server) throw new Error(`Invalid server ${server}`);

    // Send parting packet to others in lobby

    const otherPlayers = await player.findOthersByGameState('LOBBY');
    const partPacket = new PartPacket(player, PartReason.USER_LEFT);

    new Broadcast(otherPlayers, partPacket, server).writeAll();
  }
}

module.exports = PartLobbyEvent;
