'use strict';

const net = require('net');

const Connection = require('./Connection');
const Player = require('../db/models/Player');

const log = require('../Logger')('ConnHandler');

class ConnectionHandler {
  ip;
  port;

  #tcp;
  #connections;
  #nextConnectionId;
  #onConnectionListener;

  #onDisconnect(connectionId) {
    log.debug('Connection', connectionId, 'has disconnected, deleting...');

    delete this.#connections[connectionId];
  }

  constructor(ip, port) {
    this.ip = ip;
    this.port = port;

    const onSocket = socket => {
      if (typeof(this.#onConnectionListener) === 'function') {
        const connectionId = this.#nextConnectionId++;

        log.debug('Creacting connection', connectionId);

        const connection = new Connection(connectionId, socket, this.#onDisconnect.bind(this, connectionId));

        this.#connections[connectionId] = connection;

        this.#onConnectionListener(connection);
      }
    };

    this.#tcp = net.createServer(onSocket);
    this.#connections = {};
    this.#nextConnectionId = 1;
  }

  onConnection(listener) {
    if (typeof(this.#onConnectionListener) === 'function') {
      throw new Error('onConnection is already being listened!');
    }

    this.#onConnectionListener = listener;
  }

  listen() {
    log.info('Initializing connection listener...');

    this.#tcp.listen(this.port, this.ip, () => {
      log.info(`Listening on ${this.ip}:${this.port}`);
    });
  }

  getPlayerConnection(player) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);

    if (this.#connections[player.id]) return this.#connections[player.id];
    else throw new Error(`Could not find connection for player ${player}`);
  }
}

module.exports = ConnectionHandler;

