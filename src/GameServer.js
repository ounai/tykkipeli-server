'use strict';

const Database = require('./db/Database');
const DisconnectEvent = require('./events/player/DisconnectEvent');
const ConnectionHandler = require('./net/ConnectionHandler');
const PacketHandler = require('./net/PacketHandler');
const Pinger = require('./net/Pinger');
const ServerFullPacket = require('./net/packets/out/ServerFullPacket');
const Utils = require('./Utils');
const ConnectionCount = require('./ConnectionCount');
const MOTD = require('./MOTD');

const log = require('./Logger')('Server');

class GameServer {
  #connectionHandler = null;
  #database = null;
  #packetHandler = null;
  #maxPlayers = null;
  #motd = null;
  #pinger = null;
  #connectionCount = null;

  async #onDisconnect (connection) {
    log.debug('Connection', connection.id, 'disconnected');

    this.#connectionCount.onDisconnect();

    const player = await connection.getPlayer();

    if (player) new DisconnectEvent(this, connection, player).fire();
  }

  async #onConnect (connection) {
    if (await this.#connectionCount.isFull()) {
      log.info('Max number of players reached, not accepting connection');

      return new ServerFullPacket().write(connection);
    }

    log.debug(this.#connectionCount.toString());
    this.#connectionCount.onConnect();

    connection.onPacket(this.#packetHandler.onPacket.bind(this.#packetHandler, connection));
    connection.onDisconnect(this.#onDisconnect.bind(this, connection));
    connection.handshake();
  }

  #initPacketHandler (inPacketPaths) {
    this.#packetHandler = new PacketHandler(this, ...inPacketPaths);
  }

  #initConnectionHandler (ip, port) {
    this.#connectionHandler = new ConnectionHandler(ip, port);
    this.#connectionHandler.onConnection(this.#onConnect.bind(this));
  }

  async #initDatabase (config) {
    if (config.database) {
      this.#database = new Database(config.database);

      await this.#database.init();
    } else {
      log.info('Database not initialized (missing config)');
    }
  }

  get connectionHandler () {
    return this.#connectionHandler;
  }

  get motd () {
    return this.#motd;
  }

  async init (config) {
    log.info('Initializing server...');

    if (!config) {
      throw new Error(`Invalid config ${config}`);
    }

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

    this.#initPacketHandler(inPacketPaths);
    this.#initConnectionHandler(ip, port);

    this.#pinger = new Pinger(this.#connectionHandler, pingIntervalSeconds);
    this.#connectionCount = new ConnectionCount(maxPlayers);
    this.#motd = new MOTD(motd);

    await this.#initDatabase(config);

    return this;
  }

  listen () {
    if (!this.#connectionHandler) {
      throw new Error('Connection handler has not been initialized!');
    }

    this.#connectionHandler.listen();
    this.#pinger.start();

    return this;
  }
}

module.exports = GameServer;
