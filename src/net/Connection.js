'use strict';

const chalk = require('chalk');

const Packet = require('./Packet');
const PacketType = require('./PacketType');

const log = require('../Logger')('Connection');
const { getRandomInt } = require('../Utils');

class Connection {
  #socket;
  #onPacketListener;
  #onDisconnectListener;

  #lastPacketSent = 0;
  #lastPacketReceived = Number.NEGATIVE_INFINITY;

  playerId;

  async #socketOnData(buffer) {
    log.debug(
      chalk.bold('In:'),
      buffer.toString()
        .replace(/\r/g, '')
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

    if (typeof(this.#onDisconnectListener) === 'function') {
      this.#onDisconnectListener();
    }
  }

  #socketOnError(err) {
    if (err.code === 'ECONNRESET') {
      log.debug('Connection reset');

      if (typeof(this.#onDisconnectListener) === 'function') {
        this.#onDisconnectListener();
      }
    } else {
      log.error('Socket error:', err);
    }
  }

  constructor(socket) {
    log.info('New connection!');

    socket.on('data', this.#socketOnData.bind(this));
    socket.on('end', this.#socketOnEnd.bind(this));
    socket.on('error', this.#socketOnError.bind(this));

    this.#socket = socket;
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

  writePacket(packet) {
    // TODO validate type for bad data
    if (packet.type === PacketType.NONE) {
      throw new Error('Cannot write packet of type NONE!');
    } else if (packet.type === PacketType.DATA) {
      packet.sequenceNumber = this.#lastPacketSent++;
    }

    log.debug(
      chalk.bold('Out:'),
      `"${packet.toString().replace(/\t/g, chalk.blue('\\t'))}"`
    );

    return new Promise(resolve => (
      this.#socket.write(packet.toString() + '\r\n', 'utf8', resolve)
    ));
  }

  onPacket(listener) {
    if (typeof(this.#onPacketListener) === 'function') {
      throw new Error('onPacket is already being listened!');
    }

    this.#onPacketListener = listener;

    return this;
  }

  onDisconnect(listener) {
    if (typeof(this.#onDisconnectListener) === 'function') {
      throw new Error('onDisconnect is already being listened!');
    }

    this.#onDisconnectListener = listener;

    return this;
  }

  disconnect() {
    log.debug('Disconnecting client');

    this.#socket.destroy();

    if (typeof(this.#onDisconnectListener) === 'function') {
      this.#onDisconnectListener();
    }
  }
}

module.exports = Connection;

