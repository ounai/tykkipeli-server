'use strict';

const OutPacket = require('./OutPacket');

class StatusPacket extends OutPacket {
  constructor(status) {
    super('status', status);
  }
}

module.exports = StatusPacket;

