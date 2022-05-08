'use strict';

const chalk = require('chalk');

const Event = require('../Event');
const Player = require('../../db/models/Player');
const Broadcast = require('../../net/Broadcast');
const GameState = require('../../db/models/GameState');
const Connection = require('../../net/Connection');

const GameListFullPacket = require('../../net/packets/out/lobby/GameListFullPacket');
const UsersPacket = require('../../net/packets/out/lobby/UsersPacket');
const JoinPacket = require('../../net/packets/out/lobby/JoinPacket');
const JoinFromGamePacket = require('../../net/packets/out/lobby/JoinFromGamePacket');
const StatusPacket = require('../../net/packets/out/StatusPacket');
const OwnJoinPacket = require('../../net/packets/out/lobby/OwnJoinPacket');
const NumberOfUsersPacket = require('../../net/packets/out/lobby/NumberOfUsersPacket');
const ServerSayPacket = require('../../net/packets/out/lobby/ServerSayPacket');

const log = require('../../Logger')('JoinLobbyEvent');

class JoinLobbyEvent extends Event {
  async handle (server, connection, player, joinFromGame = false) {
    if (!server) throw new Error(`Invalid server ${server}`);
    if (!(connection instanceof Connection)) throw new Error(`Invalid connection ${connection}`);
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);

    log.debug(`Joining player ${chalk.magenta(player.toString())} to lobby`);

    await player.setGameState(await GameState.findByName('LOBBY'));

    new StatusPacket('lobby').write(connection);
    new OwnJoinPacket(player).write(connection);
    new NumberOfUsersPacket(player).write(connection);

    if (server.motd.isSet()) {
      const motd = server.motd.toString();

      log.debug('Writing motd:', motd);

      new ServerSayPacket(motd).write(connection);
    }

    const otherPlayersInLobby = await player.findOthersByGameState('LOBBY');

    new GameListFullPacket().write(connection);
    new UsersPacket(player, otherPlayersInLobby).write(connection);

    new Broadcast(
      otherPlayersInLobby,
      (joinFromGame ? new JoinFromGamePacket(player) : new JoinPacket(player)),
      server
    ).writeAll();
  }
}

module.exports = JoinLobbyEvent;
