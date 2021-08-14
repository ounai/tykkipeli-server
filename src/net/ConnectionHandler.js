'use strict';

const net = require('net');

const Connection = require('./Connection');

const log = require('../Logger')('ConnectionHandler');

class ConnectionHandler {
  ip;
  port;

  #tcp;
  #onConnectionListener;

  constructor(ip, port) {
    this.ip = ip;
    this.port = port;

    const onSocket = socket => {
      if (typeof(this.#onConnectionListener) === 'function') {
        this.#onConnectionListener(new Connection(socket));
      }
    };

    this.#tcp = net.createServer(onSocket);
  }

  onConnection(listener) {
    if (typeof(this.#onConnectionListener) === 'function') {
      throw new Error('onConnection is already being listened!');
    }

    this.#onConnectionListener = listener;

    return this;
  }

  listen() {
    log.info('Initializing connection listener...');

    this.#tcp.listen(this.port, this.ip, () => {
      log.info(`Listening on ${this.ip}:${this.port}`);
    });
  }
}

module.exports = ConnectionHandler;

