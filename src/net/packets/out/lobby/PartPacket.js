'use strict';

const chalk = require('chalk');

const OutPacket = require('../OutPacket');
const PartReason = require('../../../../lobby/PartReason');

const log = require('../../../../Logger')('PartPacket');

class PartPacket extends OutPacket {
  constructor (player, partReason, gameName) {
    if (!(partReason instanceof PartReason)) {
      throw new Error(`Invalid part reason ${partReason}`);
    }

    log.debug(chalk.magenta(player.toString()), 'parting lobby:', chalk.magenta(partReason.toString()));

    if (partReason === PartReason.USER_LEFT || partReason === PartReason.CONNECTION_PROBLEMS) {
      super('lobby', 'part', player.username, partReason.valueOf());
    } else {
      if (typeof gameName !== 'string' || gameName.length === 0) {
        throw new Error(`Invalid game name ${gameName}`);
      }

      super('lobby', 'part', player.username, partReason.valueOf(), gameName);
    }
  }
}

module.exports = PartPacket;
