'use strict';

const InPacket = require('./InPacket');
const PacketType = require('../../PacketType');
const BasicInfoPacket = require('../out/BasicInfoPacket');
const StatusPacket = require('../out/StatusPacket');
const OwnJoinPacket = require('../out/lobby/OwnJoinPacket');
const NumberOfUsersPacket = require('../out/lobby/NumberOfUsersPacket');
//const GameListPacket = require('../out/lobby/GameListPacket');
//const UsersPacket = require('../out/lobby/UsersPacket');
//const ServerSayPacket = require('../out/lobby/ServerSayPacket');

class LoginPacket extends InPacket {
  type = PacketType.DATA;
  usesPlayer = true;

  match(packet) {
    return packet.startsWith('login');
  }

  handle(connection, packet, player) {
    new BasicInfoPacket(
      player.isRegistered,
      player.accessLevel,
      player.creditAmount,
      player.badWordFilterEnabled,
      player.emailConfirmed
    ).write(connection);

    player.setGameState('LOBBY');

    new StatusPacket('lobby').write(connection);

    new OwnJoinPacket(player).write(connection);

    new NumberOfUsersPacket().write(connection);

    // TODO
    //   lobby numberofusers,
    //   lobby gamelist full,
    //   lobby users,
    //   lobby serversay <motd>
  }
}

module.exports = LoginPacket;

