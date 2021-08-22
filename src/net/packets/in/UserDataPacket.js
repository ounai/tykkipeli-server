'use strict';

const chalk = require('chalk');

const InPacket = require('./InPacket');
const PacketType = require('../../PacketType');

const log = require('../../../Logger')('UserDataPacket');

class UserDataPacket extends InPacket {
  type = PacketType.DATA;

  match(packet) {
    return packet.startsWith('userdata');
  }

  handle(connection, packet) {
    const data = packet.getString(1);

    log.debug('Received user data packet:', chalk.magenta(data));

    // TODO
    // (no clue how this packet is meant to be used)
  }
}

module.exports = UserDataPacket;

