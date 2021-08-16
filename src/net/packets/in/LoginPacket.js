'use strict';

const chalk = require('chalk');

const Player = require('../../../db/models/Player');
const GameState = require('../../../db/models/GameState');
const InPacket = require('./InPacket');
const PacketType = require('../../PacketType');

const BasicInfoPacket = require('../out/BasicInfoPacket');
const StatusPacket = require('../out/StatusPacket');
const OwnJoinPacket = require('../out/lobby/OwnJoinPacket');
const NumberOfUsersPacket = require('../out/lobby/NumberOfUsersPacket');
const GameListFullPacket = require('../out/lobby/GameListFullPacket');
//const UsersPacket = require('../out/lobby/UsersPacket');
//const ServerSayPacket = require('../out/lobby/ServerSayPacket');

const log = require('../../../Logger')('LoginPacket');

class LoginPacket extends InPacket {
  type = PacketType.DATA;
  usesPlayer = true;

  // TODO move
  async #requestUsername(player, username) {
    log.debug('Client requesting username', chalk.cyan(username));

    if (await Player.isUsernameInUse(username)) {
      log.debug(`Username not set, "${chalk.cyan(username)}" already in use!`);
    } else {
      await player.setUsername(username);

      log.debug(`Username "${chalk.cyan(username)}" set!`);
    }
  }

  match(packet) {
    return packet.startsWith('login');
  }

  async handle(connection, packet, player) {
    const username = packet.getString(1);

    if (typeof(username) === 'string' && username.length > 0 && username !== '-') {
      await this.#requestUsername(player, username);
    }

    await player.setGameState(await GameState.findByName('LOBBY'));

    new BasicInfoPacket(player).write(connection);
    new StatusPacket('lobby').write(connection);
    new OwnJoinPacket(player).write(connection);
    new NumberOfUsersPacket(player).write(connection);
    new GameListFullPacket().write(connection);

    // TODO
    //   lobby users,
    //   lobby serversay <motd>
    //   broadcast lobby join
  }
}

module.exports = LoginPacket;

