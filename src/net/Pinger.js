'use strict';

const PingPacket = require('./packets/out/PingPacket');

const log = require('../Logger')('Pinger');

class Pinger {
  #server;
  #intervalSeconds;
  #intervalId;

  #ping() {
    const connections = this.#server.connectionHandler.connections;

    if (connections.length > 0) {
      log.debug('Pinging', connections.length, 'connections...');

      for (const connection of connections) {
        new PingPacket().write(connection);
      }
    }
  }

  constructor(server, intervalSeconds) {
    this.#server = server;
    this.#intervalSeconds = intervalSeconds;
    this.#intervalId = null;
  }

  start() {
    log.debug('Start pinging');

    this.#intervalId = setInterval(this.#ping.bind(this), this.#intervalSeconds * 1000);
  }

  stop() {
    if (this.#intervalId === null) {
      log.debug('Cannot stop pinging, not running');
    } else {
      log.debug('Stop pinging');

      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }
}

module.exports = Pinger;

