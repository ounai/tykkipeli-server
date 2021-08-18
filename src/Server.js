'use strict';

const chalk = require('chalk');

const Database = require('./db/Database');
const Player = require('./db/models/Player');

const ConnectionHandler = require('./net/ConnectionHandler');
const PacketHandler = require('./net/PacketHandler');
const Pinger = require('./net/Pinger');
const Broadcast = require('./net/Broadcast');

const ServerFullPacket = require('./net/packets/out/ServerFullPacket');
const PartPacket = require('./net/packets/out/lobby/PartPacket');

const log = require('./Logger')('Server');

class Server {
  #connectionHandler;
  #database;
  #packetHandler;
  #maxPlayers;
  #motd;

  async #onDisconnect(connection, deletePlayer = false) {
    log.debug('Connection disconnected');

    const player = await Player.findById(connection.playerId);

    if (player) {
      if (player.isGameState('LOBBY')) {
        // Send parting packet to others in lobby
        new Broadcast(await player.findOthersByGameState('LOBBY'), new PartPacket(player, 1), this).writeAll();
      }

      if (deletePlayer) await player.destroy();
      else await player.setConnected(false);

      log.info('Player', chalk.magenta(player.toString()), (deletePlayer ? 'deleted' : 'disconnected'));
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
    connection.onDisconnect(this.#onDisconnect.bind(this, connection, true));
    connection.handshake();
  }

  async #init(config) {
    const { ip, port, maxPlayers, pingIntervalSeconds, motd } = config.server;

    if (typeof(ip) !== 'string') throw new Error(`Invalid ip ${ip}`);
    if (typeof(port) !== 'number' || isNaN(port)) throw new Error(`Invalid port ${port}`);

    if (typeof(maxPlayers) === 'number' && !isNaN(maxPlayers)) this.#maxPlayers = maxPlayers;
    else this.#maxPlayers = null;

    if (typeof(motd) === 'string' && motd.length > 0) this.#motd = motd;

    this.#packetHandler = new PacketHandler(
      this,
      './src/net/packets/in',
      './src/net/packets/in/lobby'
    );

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

