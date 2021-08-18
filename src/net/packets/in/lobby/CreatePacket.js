'use strict';

const chalk = require('chalk');

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');

const log = require('../../../../Logger')('CreatePacket');

class CreatePacket extends InPacket {
  type = PacketType.DATA;

  match(packet) {
    return packet.startsWith('lobby', 'create');
  }

  async handle(connection, packet) {
    const player = connection.getPlayer();

    log.debug('Player', chalk.magenta(player.toString()), 'is creating a new game');

    // TODO
  }
}

module.exports = CreatePacket;

