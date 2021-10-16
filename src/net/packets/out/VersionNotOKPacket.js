'use strict';

const OutPacket = require('./OutPacket');

class VersionNotOKPacket extends OutPacket {
  constructor () {
    super('error', 'vernotok');
  }
}

module.exports = VersionNotOKPacket;
