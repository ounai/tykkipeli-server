'use strict';

const OutPacket = require('./OutPacket');

class StatusPacket extends OutPacket {
  constructor (status, joinErrorType) {
    if (status === 'lobby' && joinErrorType) {
      super('status', status, joinErrorType);
    } else if (joinErrorType) {
      throw new Error(`Join error type given for unsupported status ${status}`);
    } else {
      super('status', status);
    }
  }
}

module.exports = StatusPacket;
