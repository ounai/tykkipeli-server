'use strict';

const net = require('net');

const Connection = require('./Connection');
const Player = require('../db/models/Player');

const log = require('../Logger')('ConnHandler');

class ConnectionHandler {
  #ip;
  #port;
  #tcp;
  #connections;
  #nextConnectionId;
  #onConnectionListener;

  #onDisconnect(connectionId) {
    log.debug('Connection', connectionId, 'has disconnected, deleting...');

    delete this.#connections[connectionId];
  }

  #onSocket(socket) {
    if (typeof(this.#onConnectionListener) === 'function') {
      const connectionId = this.#nextConnectionId++;

      log.debug('Creating connection', connectionId);

      const connection = new Connection(connectionId, socket, this.#onDisconnect.bind(this, connectionId));

      this.#connections[connectionId] = connection;

      this.#onConnectionListener(connection);
    }
  }

  constructor(ip, port) {
    this.#ip = ip;
    this.#port = port;

    this.#connections = {};
    this.#nextConnectionId = 1;

    this.#tcp = net.createServer(this.#onSocket.bind(this));
  }

  get connections() {
    return Object.values(this.#connections);
  }

  onConnection(listener) {
    if (typeof(this.#onConnectionListener) === 'function') {
      throw new Error('onConnection is already being listened!');
    }

    this.#onConnectionListener = listener;
  }

  listen() {
    log.info('Initializing connection listener...');

    this.#tcp.listen(this.#port, this.#ip, () => {
      log.info(`Listening on ${this.#ip}:${this.#port}`);
    });
  }

  getPlayerConnection(player) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);

    if (typeof(player.connectionId) !== 'number' || isNaN(player.connectionId)) {
      throw new Error(`Player has invalid connection id: ${player.connectionId}`);
    }

    if (this.#connections[player.connectionId]) return this.#connections[player.connectionId];
    else throw new Error(`Could not find connection for player ${player}`);
  }
}

module.exports = ConnectionHandler;

