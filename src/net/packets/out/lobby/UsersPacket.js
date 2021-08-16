'use strict';

const OutPacket = require('../OutPacket');

class UsersPacket extends OutPacket {
  constructor(player, otherPlayersInLobby) {
    const ownInfoString = player.getUserInfoString(3);
    const otherPlayersInfoStrings = otherPlayersInLobby.map(player => player.getUserInfoString(3));

    super('lobby', 'users', ownInfoString, ...otherPlayersInfoStrings);
  }
}

module.exports = UsersPacket;

