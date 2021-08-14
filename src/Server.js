'use strict';

const ConnectionHandler = require('./net/ConnectionHandler');
const Database = require('./db/Database');
const Player = require('./db/models/Player');
const ServerFullPacket = require('./net/packets/out/ServerFullPacket');

const log = require('./Logger')('Server');
const { getFilenamesInDirectory } = require('./utils');

class Server {
  connectionHandler;
  database;

  maxPlayers;

  #packetHandlers;

  async #packetHandlerHandlePacket(connection, packet, packetHandler) {
    if (typeof(packetHandler.usesPlayer) !== 'boolean' || !packetHandler.usesPlayer) {
      // Does not use player

      await packetHandler.handle(connection, packet);
    } else {
      // Uses player

      if (typeof(connection.playerId) !== 'number') {
        throw new Error(`Invalid player id ${connection.playerId}`);
      }

      const player = await Player.findById(connection.playerId);

      log.debug('Fetched player for packet handler', packetHandler.constructor.name);

      if (!player) throw new Error(`No player found but ${packetHandler.constructor.name} requires one!`);
      else if (!player.connected) throw new Error(`Cannot handle ${packetHandler.constructor.name}, player is not connected!`);
      else await packetHandler.handle(connection, packet, player);
    }
  }

  async #onPacket(connection, packet) {
    let handled = false;

    for (const packetHandler of this.#packetHandlers) {
      if (packetHandler.match(packet)) {
        log.debug('Packet matches', packetHandler.constructor.name);

        await this.#packetHandlerHandlePacket(connection, packet, packetHandler);

        handled = true;
      }
    }

    if (!handled) {
      log.debugError('Packet not handled!', packet);
    }
  }

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

    connection.onPacket(packet => this.#onPacket(connection, packet));
    connection.onDisconnect(() => this.#onDisconnect(connection));
    connection.handshake();
  }

  #registerPacketHandlers() {
    this.#packetHandlers = [];

    for (const filename of getFilenamesInDirectory('./src/net/packets/in', 'js')) {
      log.debug('Registering packet', filename);

      const PacketHandler = require(`./net/packets/in/${filename}`);

      this.#packetHandlers.push(new PacketHandler());
    }
  }

  async #init(config) {
    const { ip, port, maxPlayers } = config.server;

    if (typeof(ip) !== 'string') throw new Error(`Invalid ip ${ip}`);
    if (typeof(port) !== 'number' || isNaN(port)) throw new Error(`Invalid port ${port}`);

    if (typeof(maxPlayers) === 'number' && !isNaN(maxPlayers)) this.maxPlayers = maxPlayers;
    else this.maxPlayers = null;

    this.database = new Database(config.database);
    await this.database.init();

    this.#registerPacketHandlers();

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

