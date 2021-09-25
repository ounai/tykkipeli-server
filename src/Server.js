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

  async #isFull() {
    if (this.#maxPlayers === null) return false;
    else {
      const connectedPlayers = await Player.countConnected();

      log.info('Player count before join:', connectedPlayers, '/', this.#maxPlayers);

      return (connectedPlayers >= this.#maxPlayers);
    }
  }

  async #onDisconnect(connection) {
    log.debug('Connection', connection.id, 'disconnected');

    const player = await connection.getPlayer();

    if (player) new DisconnectEvent(this, player);
  }

  async #onConnect(connection) {
    if (await this.#isFull()) {
      log.info('Max number of players reached, not accepting connection');

      return new ServerFullPacket().write(connection);
    }

    connection.onPacket(this.#packetHandler.onPacket.bind(this.#packetHandler, connection));
    connection.onDisconnect(this.#onDisconnect.bind(this, connection));
    connection.handshake();
  }

  #init(config, afterInitCallback) {
    if (!config.server || Object.keys(config.server).length === 0) {
      throw new Error(`Invalid server config ${config.server}`);
    }

    const { ip, port, maxPlayers, pingIntervalSeconds, motd, inPacketPaths } = config.server;

    if (typeof(ip) !== 'string' || !Utils.isIP(ip)) throw new Error(`Invalid ip ${ip}`);
    if (typeof(port) !== 'number' || isNaN(port) || port < 1 || port > 65535) throw new Error(`Invalid port ${port}`);

    if (typeof(maxPlayers) === 'number' && !isNaN(maxPlayers)) this.#maxPlayers = maxPlayers;
    else this.#maxPlayers = null;

    if (typeof(motd) === 'string' && motd.length > 0) this.#motd = motd;

    this.#packetHandler = new PacketHandler(this, ...inPacketPaths);

    this.#connectionHandler = new ConnectionHandler(ip, port);
    this.#connectionHandler.onConnection(this.#onConnect.bind(this));

    if (typeof(pingIntervalSeconds) !== 'number' || isNaN(pingIntervalSeconds) || pingIntervalSeconds <= 0) {
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

  constructor(config, afterInitCallback) {
    log.info('Creating server...');

    if (!config) {
      throw new Error(`Invalid config ${config}`);
    }

    this.#init(config, () => typeof(afterInitCallback) === 'function' && afterInitCallback(this));
  }

  get connectionHandler() {
    return this.#connectionHandler;
  }

  get motd() {
    return this.#motd ?? null;
  }

  listen() {
    this.#connectionHandler.listen();

    new Pinger(this, this.#pingIntervalSeconds).start();
  }
}

module.exports = Server;

