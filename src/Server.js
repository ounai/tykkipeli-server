'use strict';

const chalk = require('chalk');

const ConnectionHandler = require('./net/ConnectionHandler');
const Database = require('./db/Database');
const Player = require('./db/models/Player');
const ServerFullPacket = require('./net/packets/out/ServerFullPacket');
const PacketHandler = require('./net/PacketHandler');
const OutPacket = require('./net/packets/out/OutPacket');

const log = require('./Logger')('Server');

class Server {
  #connectionHandler;
  #database;
  #packetHandler;
  #maxPlayers;

  async #onDisconnect(connection) {
    log.debug('Connection disconnected');

    const player = await Player.findById(connection.playerId);

    if (player) {
      player.setConnected(false);

      log.info('Player', chalk.magenta(player.toString()), 'disconnected');
    }
  }

  async #onConnect(connection) {
    if (this.#maxPlayers !== null) {
      const connectedPlayers = await Player.countConnected();

      log.info('Player count before join:', connectedPlayers, '/', this.#maxPlayers);

      if (connectedPlayers >= this.#maxPlayers) {
        log.info('Max number of players reached, not accepting connection');

        return new ServerFullPacket().write(connection);
      }
    }

    connection.onPacket(this.#packetHandler.onPacket.bind(this.#packetHandler, connection));
    connection.onDisconnect(this.#onDisconnect.bind(this, connection));
    connection.handshake();
  }

  async #init(config) {
    const { ip, port, maxPlayers } = config.server;

    if (typeof(ip) !== 'string') throw new Error(`Invalid ip ${ip}`);
    if (typeof(port) !== 'number' || isNaN(port)) throw new Error(`Invalid port ${port}`);

    if (typeof(maxPlayers) === 'number' && !isNaN(maxPlayers)) this.#maxPlayers = maxPlayers;
    else this.#maxPlayers = null;

    this.#packetHandler = new PacketHandler(
      this,
      './src/net/packets/in',
      './src/net/packets/in/lobby'
    );

    this.#database = new Database(config.database);
    await this.#database.init();

    this.#connectionHandler = new ConnectionHandler(ip, port);
    this.#connectionHandler.onConnection(this.#onConnect.bind(this));
  }

  constructor(config, afterInitCallback) {
    log.info('Creating server...');

    this.#init(config).then(() => typeof(afterInitCallback) === 'function' && afterInitCallback(this));
  }

  listen() {
    this.#connectionHandler.listen();
  }

  broadcast(players, packet) {
    if (!(packet instanceof OutPacket)) throw new Error(`Invalid outgoing packet ${packet}`);

    if (players.length === 0) {
      log.debug(`Not broadcasting ${packet.constructor.name}, empty audience`);
    } else {
      for (const player of players) {
        if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);

        if (player.isConnected) {
          log.debug('Sending', packet.constructor.name, 'to', chalk.magenta(player.toString()));

          packet.write(this.#connectionHandler.getPlayerConnection(player));
        } else {
          log.debug('Not sending', packet.constructor.name, 'to', chalk.magenta(player.toString()), '(player not connected)');
        }
      }
    }
  }
}

module.exports = Server;

