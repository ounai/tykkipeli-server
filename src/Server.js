'use strict';

const Database = require('./db/Database');
const Player = require('./db/models/Player');
const DisconnectEvent = require('./events/player/DisconnectEvent');
const ConnectionHandler = require('./net/ConnectionHandler');
const PacketHandler = require('./net/PacketHandler');
const Pinger = require('./net/Pinger');
const ServerFullPacket = require('./net/packets/out/ServerFullPacket');
const Utils = require('./Utils');

const log = require('./Logger')('Server');

class Server {
  #connectionHandler;
  #database;
  #packetHandler;
  #maxPlayers;
  #motd;
  #pingIntervalSeconds;

  async #isFull () {
    if (this.#maxPlayers === null) return false;
    else {
      const connectedPlayers = await Player.countConnected();

      log.info(
        'Player count before join:',
        connectedPlayers, '/', this.#maxPlayers
      );

      return (connectedPlayers >= this.#maxPlayers);
    }
  }

  async #onDisconnect (connection) {
    log.debug('Connection', connection.id, 'disconnected');

    const player = await connection.getPlayer();

    if (player) new DisconnectEvent(this, player);
  }

  async #onConnect (connection) {
    if (await this.#isFull()) {
      log.info('Max number of players reached, not accepting connection');

      return new ServerFullPacket().write(connection);
    }

    const packetHandler = this.#packetHandler;

    connection.onPacket(packetHandler.onPacket.bind(packetHandler, connection));
    connection.onDisconnect(this.#onDisconnect.bind(this, connection));
    connection.handshake();
  }

  #initPacketHandler (inPacketPaths) {
    this.#packetHandler = new PacketHandler(this, ...inPacketPaths);
  }

  #initConnectionHandler (ip, port) {
    this.#connectionHandler = new ConnectionHandler(ip, port)
      .onConnection(this.#onConnect.bind(this));
  }

  #init (config, afterInitCallback) {
    if (!config.server || Object.keys(config.server).length === 0) {
      throw new Error(`Invalid server config ${config.server}`);
    }

    const {
      ip,
      port,
      maxPlayers,
      pingIntervalSeconds,
      motd,
      inPacketPaths
    } = config.server;

    Utils.validateIP(ip);
    Utils.validatePort(port);

    this.#maxPlayers = (
      typeof maxPlayers === 'number' && !isNaN(maxPlayers)
        ? maxPlayers
        : null
    );

    if (typeof motd === 'string' && motd.length > 0) this.#motd = motd;

    this.#initPacketHandler(inPacketPaths);
    this.#initConnectionHandler(ip, port);

    if (
      typeof pingIntervalSeconds !== 'number' ||
      isNaN(pingIntervalSeconds) ||
      pingIntervalSeconds <= 0
    ) {
      throw new Error(`Invalid ping interval ${pingIntervalSeconds}`);
    }

    this.#pingIntervalSeconds = pingIntervalSeconds;

    if (config.database) {
      this.#database = new Database(config.database);

      this.#database.init().then(afterInitCallback);
    } else {
      this.#database = null;

      log.info('Database not initialized (missing config)');

      afterInitCallback();
    }
  }

  constructor (config, afterInitCallback) {
    log.info('Creating server...');

    if (!config) {
      throw new Error(`Invalid config ${config}`);
    }

    const initCallback = () => (
      typeof afterInitCallback === 'function' &&
      afterInitCallback(this)
    );

    this.#init(config, initCallback);
  }

  get connectionHandler () {
    return this.#connectionHandler;
  }

  get motd () {
    return this.#motd ?? null;
  }

  listen () {
    this.#connectionHandler.listen();

    new Pinger(this, this.#pingIntervalSeconds).start();
  }
}

module.exports = Server;
