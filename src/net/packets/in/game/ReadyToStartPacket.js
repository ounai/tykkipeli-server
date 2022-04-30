'use strict';

const chalk = require('chalk');

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');

const log = require('../../../../Logger')('ReadyToStartPacket');

class ReadyToStartPacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('game', 'readytostart');
  }

  async handle (connection, packet) {
    const player = await connection.getPlayer();

    log.debug('Player', chalk.magenta(player.toString()), 'is ready to start');

    // TODO
  }
}

module.exports = ReadyToStartPacket;
