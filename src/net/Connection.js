'use strict';

const chalk = require('chalk');

const Packet = require('./Packet');
const PacketType = require('./PacketType');
const Player = require('../db/models/Player');

const config = require('../config');
const log = require('../Logger')('Connection');

const noLogPacketStrings = {
  in: [],
  out: []
};

if (config.logging.disablePing) {
  noLogPacketStrings.in.push(`"c pong${chalk.blue('\\n')}"`);
  noLogPacketStrings.out.push(`"c ping${chalk.blue('\\n')}"`);
}

class Connection {
  #socket = null;
  #onPacketListener = null;
  #onDisconnectListener = null;
  #afterDisconnectCallback = null;

  #lastPacketSent = null;
  #lastPacketReceived = null;

  #id = null;
  #playerId = null;

  // Returns true if sequence number is as expected, false if packet should be skipped
  #verifySequenceNumber (sequenceNumber) {
    if (this.#lastPacketReceived !== null) {
      if (sequenceNumber <= this.#lastPacketReceived) {
        // Packet sequence number too low, duplicate packet
        log.debug('Skipping duplicate packet!');

        return false;
      }

      if (sequenceNumber > this.#lastPacketReceived + 1) {
        // Packet sequence number too high, at least one packet has been missed
        // There's no logic on the client side to recover from this, so we're just going to disconnect by throwing

        const missedCount = sequenceNumber + this.#lastPacketReceived + 1;

        throw new Error(`Connection ${this.#id} missed ${missedCount} packet(s)`);
      }
    }

    this.#lastPacketReceived = sequenceNumber;

    return true;
  }

  async #socketOnData (buffer) {
    const packetString = buffer.toString()
      .replace(/\r/g, chalk.blue('\\r'))
      .replace(/\n/g, chalk.blue('\\n') + '\n')
      .split('\n')
      .filter(s => !!s)
      .map(s => s.replace(/\t/g, chalk.blue('\\t')))
      .map(s => `"${s}"`)
      .join(', ');

    if (!noLogPacketStrings.in.includes(packetString)) {
      log.debug(chalk.bold('In:'), packetString);
    }

    try {
      for (const packetString of buffer.toString().split('\n')) {
        if (packetString.length === 0) continue;

        const packet = new Packet(packetString);

        if (packet.type === PacketType.DATA) {
          if (!this.#verifySequenceNumber(packet.sequenceNumber)) {
            return;
          }
        }

        if (typeof this.#onPacketListener === 'function') {
          await this.#onPacketListener(packet);
        }
      }
    } catch (err) {
      log.error(`Error in connection ${this.id}, disconnecting client:`, err?.message ?? err);

      this.disconnect();
    }
  }

  #socketOnEnd () {
    log.debug('Socket closed');

    this.disconnect();
  }

  #socketOnError (err) {
    if (err.code === 'ECONNRESET') {
      log.debug('Connection reset');

      this.disconnect();
    } else {
      log.error('Socket error:', err);
    }
  }

  constructor (id, socket, afterDisconnectCallback) {
    log.info('New connection', id);

    this.#id = id;
    this.#socket = socket;

    if (typeof afterDisconnectCallback === 'function') {
      this.#afterDisconnectCallback = afterDisconnectCallback;
    }

    socket.on('data', this.#socketOnData.bind(this));
    socket.on('end', this.#socketOnEnd.bind(this));
    socket.on('error', this.#socketOnError.bind(this));
  }

  set playerId (playerId) {
    this.#playerId = playerId;
  }

  get playerId () {
    return this.#playerId;
  }

  get id () {
    return this.#id;
  }

  getNextSequenceNumber () {
    if (this.#lastPacketSent === null) this.#lastPacketSent = 0;
    else this.#lastPacketSent++;

    return this.#lastPacketSent;
  }

  handshake () {
    this.#socket.write('h 1\nc ctr\n', 'utf8');
  }

  write (data, encoding = 'utf8') {
    const packetString = ['"', '"'].join(
      data.replace(/\r/g, chalk.blue('\\r'))
        .replace(/\n/g, chalk.blue('\\n'))
        .replace(/\t/g, chalk.blue('\\t'))
    );

    if (!noLogPacketStrings.out.includes(packetString)) {
      log.debug(chalk.bold('Out:'), packetString);
    }

    return new Promise(resolve => (
      this.#socket.write(data, encoding, resolve)
    ));
  }

  onPacket (listener) {
    if (typeof this.#onPacketListener === 'function') {
      throw new Error('onPacket is already being listened!');
    }

    this.#onPacketListener = listener;
  }

  onDisconnect (listener) {
    if (typeof this.#onDisconnectListener === 'function') {
      throw new Error('onDisconnect is already being listened!');
    }

    this.#onDisconnectListener = listener;
  }

  disconnect () {
    log.debug('Disconnecting client');

    if (typeof this.#onDisconnectListener === 'function') {
      this.#onDisconnectListener();
    }

    this.#socket.destroy();

    if (typeof this.#afterDisconnectCallback === 'function') {
      this.#afterDisconnectCallback();
    }
  }

  async getPlayer () {
    if (typeof this.#playerId !== 'number') return null;

    const player = await Player.findById(this.#playerId);

    if (!player) throw new Error(`Player not found with id ${this.#playerId}`);
    else if (!player.isConnected) throw new Error(`Player ${player.toString} is not connected`);

    return player;
  }
}

module.exports = Connection;
