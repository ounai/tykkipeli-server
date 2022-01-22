'use strict';

const PingPacket = require('./packets/out/PingPacket');

const config = require('../config');
const log = require('../Logger')('Pinger');

class Pinger {
  #connectionHandler;
  #intervalSeconds;
  #intervalId;

  #ping () {
    const connections = this.#connectionHandler.connections;

    if (connections.length > 0) {
      if (!config.logging.disablePing) {
        log.debug('Pinging', connections.length, 'connections...');
      }

      for (const connection of connections) {
        new PingPacket().write(connection);
      }
    }
  }

  constructor (connectionHandler, intervalSeconds) {
    if (
      typeof intervalSeconds !== 'number' ||
      isNaN(intervalSeconds) ||
      intervalSeconds <= 0
    ) {
      throw new Error(`Invalid ping interval ${intervalSeconds}`);
    }

    this.#connectionHandler = connectionHandler;
    this.#intervalSeconds = intervalSeconds;
    this.#intervalId = null;
  }

  start () {
    if (this.#intervalId === null) {
      log.debug('Start pinging');

      this.#intervalId = setInterval(this.#ping.bind(this), this.#intervalSeconds * 1000);
    } else {
      log.error('Cannot start pinging, already running');
    }
  }

  stop () {
    if (this.#intervalId === null) {
      log.error('Cannot stop pinging, not running');
    } else {
      log.debug('Stop pinging');

      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }
}

module.exports = Pinger;
