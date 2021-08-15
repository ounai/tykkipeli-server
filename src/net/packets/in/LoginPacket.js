'use strict';

const Player = require('../../../db/models/Player');
const GameState = require('../../../db/models/GameState');
const InPacket = require('./InPacket');
const PacketType = require('../../PacketType');
const BasicInfoPacket = require('../out/BasicInfoPacket');
const StatusPacket = require('../out/StatusPacket');
const OwnJoinPacket = require('../out/lobby/OwnJoinPacket');
const NumberOfUsersPacket = require('../out/lobby/NumberOfUsersPacket');
//const GameListPacket = require('../out/lobby/GameListPacket');
//const UsersPacket = require('../out/lobby/UsersPacket');
//const ServerSayPacket = require('../out/lobby/ServerSayPacket');

const log = require('../../../Logger')('LoginPacket');

class LoginPacket extends InPacket {
  type = PacketType.DATA;
  usesPlayer = true;

  match(packet) {
    return packet.startsWith('login');
  }

  async handle(connection, packet, player) {
    const username = packet.getString(1);

    if (typeof(username) === 'string' && username.length > 0 && username !== '-') {
      log.debug('Client logged in with username:', username);

      if (await Player.isUsernameInUse(username)) {
        log.debug(`Username not set, "${username}" already in use!`);
      } else {
        await player.setUsername(username);

        log.debug(`Username "${username}" set!`);
      }
    }

    new BasicInfoPacket(
      player.isRegistered,
      player.accessLevel,
      player.creditAmount,
      player.badWordFilterEnabled,
      player.emailConfirmed
    ).write(connection);

    await player.setGameState(await GameState.findByName('LOBBY'));

    new StatusPacket('lobby').write(connection);

    new OwnJoinPacket(player).write(connection);

    new NumberOfUsersPacket(player).write(connection);

    // TODO
    //   lobby gamelist full,
    //   lobby users,
    //   lobby serversay <motd>
  }
}

module.exports = LoginPacket;

