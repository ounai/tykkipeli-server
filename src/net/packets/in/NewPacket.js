'use strict';

const Player = require('../../../db/models/Player');
const GameState = require('../../../db/models/GameState');
const IDPacket = require('../out/IDPacket');
const PacketType = require('../../PacketType');
const InPacket = require('./InPacket');

const log = require('../../../Logger')('NewPacket');

class NewPacket extends InPacket {
  type = PacketType.COMMAND;

  match(packet) {
    return packet.startsWith('new');
  }

  async handle(connection) {
    log.debug('NewPacket received from connection', connection.id);

    const player = await Player.create();

    connection.playerId = player.id;

    await player.setGameState(await GameState.findByName('NONE'));
    await player.setConnected(true);
    await player.setConnectionId(connection.id);

    log.debug(`Created new player (id=${player.id}, connectionId=${player.connectionId})`);

    new IDPacket(player.id).write(connection);
  }
}

module.exports = NewPacket;

