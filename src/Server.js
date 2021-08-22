'use strict';

const Database = require('./db/Database');
const Player = require('./db/models/Player');
const DisconnectEvent = require('./events/player/DisconnectEvent');
const ConnectionHandler = require('./net/ConnectionHandler');
const PacketHandler = require('./net/PacketHandler');
const Pinger = require('./net/Pinger');
const ServerFullPacket = require('./net/packets/out/ServerFullPacket');

const log = require('./Logger')('Server');

const inPacketPaths = [
  './src/net/packets/in',
  './src/net/packets/in/lobby'
];

class Server {
  #connectionHandler;
  #database;
  #packetHandler;
  #maxPlayers;
  #motd;

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

  async #init(config) {
    const { ip, port, maxPlayers, pingIntervalSeconds, motd } = config.server;

    if (typeof(ip) !== 'string') throw new Error(`Invalid ip ${ip}`);
    if (typeof(port) !== 'number' || isNaN(port)) throw new Error(`Invalid port ${port}`);

    if (typeof(maxPlayers) === 'number' && !isNaN(maxPlayers)) this.#maxPlayers = maxPlayers;
    else this.#maxPlayers = null;

    if (typeof(motd) === 'string' && motd.length > 0) this.#motd = motd;

    this.#packetHandler = new PacketHandler(this, ...inPacketPaths);

    this.#database = new Database(config.database);
    await this.#database.init();

    this.#connectionHandler = new ConnectionHandler(ip, port);
    this.#connectionHandler.onConnection(this.#onConnect.bind(this));

    new Pinger(this, pingIntervalSeconds).start();
  }

  constructor(config, afterInitCallback) {
    log.info('Creating server...');

    this.#init(config).then(() => typeof(afterInitCallback) === 'function' && afterInitCallback(this));
  }

  get connectionHandler() {
    return this.#connectionHandler;
  }

  get motd() {
    return this.#motd ?? null;
  }

  listen() {
    this.#connectionHandler.listen();
  }
}

module.exports = Server;

