'use strict';

const OutPacket = require('./OutPacket');

class UnrecoverableErrorPacket extends OutPacket {
  constructor () {
    super('error', '-');
  }
}

module.exports = UnrecoverableErrorPacket;
