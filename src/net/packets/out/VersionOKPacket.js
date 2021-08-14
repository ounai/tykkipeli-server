'use strict';

const OutPacket = require('./OutPacket');

class VersionOKPacket extends OutPacket {
  constructor() {
    super('versok');
  }
}

module.exports = VersionOKPacket;

