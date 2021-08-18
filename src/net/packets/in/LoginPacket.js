'use strict';

const GameState = require('../../../db/models/GameState');
const InPacket = require('./InPacket');
const PacketType = require('../../PacketType');
const Broadcast = require('../../Broadcast');

const BasicInfoPacket = require('../out/BasicInfoPacket');
const StatusPacket = require('../out/StatusPacket');
const OwnJoinPacket = require('../out/lobby/OwnJoinPacket');
const NumberOfUsersPacket = require('../out/lobby/NumberOfUsersPacket');
const GameListFullPacket = require('../out/lobby/GameListFullPacket');
const UsersPacket = require('../out/lobby/UsersPacket');
const JoinPacket = require('../out/lobby/JoinPacket');
const ServerSayPacket = require('../out/lobby/ServerSayPacket');

const log = require('../../../Logger')('LoginPacket');

class LoginPacket extends InPacket {
  type = PacketType.DATA;

  match(packet) {
    return packet.startsWith('login');
  }

  async handle(connection, packet) {
    const player = await connection.getPlayer();

    const username = packet.getString(1);

    if (typeof(username) === 'string' && username.length > 0 && username !== '-') {
      await player.requestUsername(username);
    }

    await player.setGameState(await GameState.findByName('LOBBY'));

    if (!player.hasLoggedIn) {
      log.debug('First LoginPacket, sending basic info');

      new BasicInfoPacket(player).write(connection);
      new StatusPacket('lobby').write(connection);
      new OwnJoinPacket(player).write(connection);
      new NumberOfUsersPacket(player).write(connection);

      if (typeof(this.server.motd) === 'string' && this.server.motd.length > 0) {
        log.debug('Writing motd:', this.server.motd);

        new ServerSayPacket(this.server.motd).write(connection);
      }

      await player.setHasLoggedIn(true);
    } else {
      log.debug('Player has logged in before, not resending basic info again');
    }

    const otherPlayersInLobby = await player.findOthersByGameState('LOBBY');

    new GameListFullPacket().write(connection);
    new UsersPacket(player, otherPlayersInLobby).write(connection);

    new Broadcast(otherPlayersInLobby, new JoinPacket(player), this.server).writeAll();
  }
}

module.exports = LoginPacket;

