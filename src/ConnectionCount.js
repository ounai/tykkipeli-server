'use strict';

const log = require('./Logger')('ConnectionCount');

class ConnectionCount {
  #connections = 0;
  #maxConnections = null;
  #logging;

  constructor (maxConnections, logging = true) {
    if (typeof maxConnections !== 'number' || isNaN(maxConnections) || maxConnections <= 0) {
      if (logging) log.info('Max connections: unlimited');
    } else {
      if (logging) log.info('Max connections:', maxConnections);

      this.#maxConnections = maxConnections;
    }

    this.#logging = logging;
  }

  get connections () {
    return this.#connections;
  }

  isFull () {
    return this.#maxConnections === null
      ? false
      : this.#connections >= this.#maxConnections;
  }

  onConnect () {
    if (this.#logging) log.debug(this.toString());

    this.#connections++;

    if (this.#maxConnections !== null && this.#connections > this.#maxConnections) {
      this.#connections = this.#maxConnections;
    }
  }

  onDisconnect () {
    if (this.#connections === 0) {
      throw new Error('onDisconnect called when no connections present!');
    }

    this.#connections--;
  }

  toString () {
    return `Connections: ${this.#connections} / ${this.#maxConnections}`;
  }
}

module.exports = ConnectionCount;
