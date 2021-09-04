'use strict';

const OutPacket = require('../OutPacket');

class UsersPacket extends OutPacket {
  constructor(player, otherPlayersInLobby) {
    const ownInfoString = player.getUserInfoString();
    const otherPlayersInfoStrings = otherPlayersInLobby.map(player => player.getUserInfoString());

    super('lobby', 'users', ownInfoString, ...otherPlayersInfoStrings);
  }
}

module.exports = UsersPacket;

