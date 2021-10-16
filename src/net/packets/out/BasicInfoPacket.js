'use strict';

const OutPacket = require('./OutPacket');

class BasicInfoPacket extends OutPacket {
  constructor (player) {
    const isRegistered = player.isRegistered ? 't' : 'f';
    const accessLevel = player.accessLevel;
    const creditAmount = player.creditAmount;
    const badWordFilterEnabled = player.badWordFilterEnabled ? 't' : 'f';
    const emailUnconfirmed = !player.emailConfirmed ? 't' : 'f';

    super('basicinfo', isRegistered, accessLevel, creditAmount, badWordFilterEnabled, emailUnconfirmed);
  }
}

module.exports = BasicInfoPacket;
