'use strict';

const chalk = require('chalk');

const Packet = require('./Packet');
const PacketType = require('./PacketType');
const Player = require('../db/models/Player');

const log = require('../Logger')('Connection');
const { getRandomInt } = require('../Utils');

class Connection {
  #socket;
  #onPacketListener;
  #onDisconnectListener;
  #afterDisconnectCallback;

  #lastPacketSent = null;
  #lastPacketReceived = Number.NEGATIVE_INFINITY;

  #id;
  #playerId;

  async #socketOnData(buffer) {
    log.debug(
      chalk.bold('In:'),
      buffer.toString()
        .replace(/\r/g, chalk.blue('\\r'))
        .replace(/\n/g, chalk.blue('\\n') + '\n')
        .split('\n')
        .filter(s => !!s)
        .map(s => s.replace(/\t/g, chalk.blue('\\t')))
        .map(s => `"${s}"`)
        .join(', ')
    );

    try {
      for (const packetString of buffer.toString().split('\n')) {
        if (packetString.length === 0) continue;

        const packet = new Packet(packetString);

        if (packet.type === PacketType.DATA) {
          if (packet.sequenceNumber <= this.#lastPacketReceived) {
            return log.debug('Skipping duplicate packet!');
          }

          this.#lastPacketReceived = packet.sequenceNumber;
        }

        if (typeof(this.#onPacketListener) === 'function') {
          await this.#onPacketListener(packet);
        }
      }
    } catch (err) {
      log.error('Error in connection, disconnecting client:', err);

      this.disconnect();
    }
  }

  #socketOnEnd() {
    log.debug('Socket closed');

    this.disconnect();
  }

  #socketOnError(err) {
    if (err.code === 'ECONNRESET') {
      log.debug('Connection reset');

      this.disconnect();
    } else {
      log.error('Socket error:', err);
    }
  }

  constructor(id, socket, afterDisconnectCallback) {
    log.info('New connection', id);

    this.#id = id;
    this.#socket = socket;
    this.#afterDisconnectCallback = afterDisconnectCallback;

    socket.on('data', this.#socketOnData.bind(this));
    socket.on('end', this.#socketOnEnd.bind(this));
    socket.on('error', this.#socketOnError.bind(this));
  }

  set playerId(playerId) {
    this.#playerId = playerId;
  }

  get id() {
    return this.#id;
  }

  get nextSequenceNumber() {
    if (this.#lastPacketSent === null) return this.#lastPacketSent = 0;
    else return ++this.#lastPacketSent;
  }

  handshake() {
    const randomInt = getRandomInt(1000000000);

    this.#socket.write(
      'h 1\r\n'
        + `c io ${randomInt}\r\n`
        + 'c crt 25\r\n'
        + 'c ctr\r\n',
      'utf8'
    );
  }

  write(data, encoding = 'utf8') {
    log.debug(
      chalk.bold('Out:'),
      ['"', '"'].join(
        data.replace(/\r/g, chalk.blue('\\r'))
          .replace(/\n/g, chalk.blue('\\n'))
          .replace(/\t/g, chalk.blue('\\t'))
      )
    );

    return new Promise(resolve => (
      this.#socket.write(data, encoding, resolve)
    ));
  }

  onPacket(listener) {
    if (typeof(this.#onPacketListener) === 'function') {
      throw new Error('onPacket is already being listened!');
    }

    this.#onPacketListener = listener;
  }

  onDisconnect(listener) {
    if (typeof(this.#onDisconnectListener) === 'function') {
      throw new Error('onDisconnect is already being listened!');
    }

    this.#onDisconnectListener = listener;
  }

  disconnect() {
    log.debug('Disconnecting client');

    if (typeof(this.#onDisconnectListener) === 'function') {
      this.#onDisconnectListener();
    }

    this.#socket.destroy();

    if (typeof(this.#afterDisconnectCallback) === 'function') {
      this.#afterDisconnectCallback();
    }
  }

  async getPlayer() {
    if (typeof(this.#playerId) !== 'number') {
      throw new Error(`Invalid player id ${this.#playerId}`);
    }

    const player = await Player.findById(this.#playerId);

    if (!player) throw new Error(`Player not found with id ${this.#playerId}`);
    else if (!player.isConnected) throw new Error(`Player ${player.toString} is not connected`);

    return player;
  }
}

module.exports = Connection;

