'use strict';

const ConnectionHandler = require('./net/ConnectionHandler');
const Database = require('./db/Database');
const Player = require('./db/models/Player');
const ServerFullPacket = require('./net/packets/out/ServerFullPacket');
const PacketHandler = require('./net/PacketHandler');

const log = require('./Logger')('Server');

class Server {
  connectionHandler;
  database;
  packetHandler;

  maxPlayers;

  async #onDisconnect(connection) {
    log.debug('Connection disconnected');

    const player = await Player.findById(connection.playerId);

    if (player) {
      player.setConnected(false);

      log.info('Player', player.id, 'disconnected');
    }
  }

  async #onConnection(connection) {
    if (this.maxPlayers !== null) {
      const connectedPlayers = await Player.countConnected();

      log.info('Player count:', connectedPlayers, '/', this.maxPlayers);

      if (connectedPlayers >= this.maxPlayers) {
        log.info('Max number of players reached, not accepting connection');

        return new ServerFullPacket().write(connection);
      }
    }

    connection.onPacket(packet => this.packetHandler.onPacket(connection, packet));
    connection.onDisconnect(() => this.#onDisconnect(connection));
    connection.handshake();
  }

  async #init(config) {
    const { ip, port, maxPlayers } = config.server;

    if (typeof(ip) !== 'string') throw new Error(`Invalid ip ${ip}`);
    if (typeof(port) !== 'number' || isNaN(port)) throw new Error(`Invalid port ${port}`);

    if (typeof(maxPlayers) === 'number' && !isNaN(maxPlayers)) this.maxPlayers = maxPlayers;
    else this.maxPlayers = null;

    this.packetHandler = new PacketHandler(
      './src/net/packets/in',
      './src/net/packets/in/lobby'
    );

    this.database = new Database(config.database);
    await this.database.init();

    this.connectionHandler = new ConnectionHandler(ip, port);
    this.connectionHandler.onConnection(this.#onConnection.bind(this));
  }

  constructor(config, afterInitCallback) {
    log.info('Creating server...');

    this.#init(config).then(() => typeof(afterInitCallback) === 'function' && afterInitCallback(this));
  }

  listen() {
    this.connectionHandler.listen();

    return this;
  }
}

module.exports = Server;

