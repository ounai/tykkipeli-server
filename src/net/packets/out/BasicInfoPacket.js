'use strict';

const OutPacket = require('./OutPacket');

class BasicInfoPacket extends OutPacket {
  constructor(isRegistered, accessLevel, creditAmount, badWordFilterEnabled, emailConfirmed) {
    const emailUnconfirmed = !emailConfirmed;

    super(
      'basicinfo',
      isRegistered ? 't' : 'f',
      accessLevel,
      creditAmount,
      badWordFilterEnabled ? 't' : 'f',
      emailUnconfirmed ? 't' : 'f'
    );
  }
}

module.exports = BasicInfoPacket;

