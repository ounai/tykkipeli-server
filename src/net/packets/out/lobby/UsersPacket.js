'use strict';

const OutPacket = require('../OutPacket');

class UsersPacket extends OutPacket {
  constructor (player, otherPlayersInLobby) {
    const ownInfoString = player.getLobbyInfoString();
    const otherPlayersInfoStrings = otherPlayersInLobby.map(player => player.getLobbyInfoString());

    super('lobby', 'users', ownInfoString, ...otherPlayersInfoStrings);
  }
}

module.exports = UsersPacket;
