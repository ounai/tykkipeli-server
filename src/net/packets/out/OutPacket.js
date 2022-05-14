'use strict';

const chalk = require('chalk');

const PacketType = require('../../PacketType');
const Packet = require('../../Packet');

const config = require('../../../config');
const log = require('../../../Logger')('OutPacket');

const noLogPackets = [];

if (config.logging.disablePing) {
  noLogPackets.push('PingPacket');
}

class OutPacket {
  #packet;

  #busy = false;
  #busyCallbacks = [];

  constructor (...args) {
    this.#packet = new Packet();
    this.#packet.type = PacketType.DATA;

    if (args.length === 1 && typeof args[0] === 'function') {
      // Arguments given via async function
      this.#asyncArgs(args[0]);
      this.#busy = true;
    } else {
      // Args given in constructor
      this.#packet.args = args;
    }
  }

  async #asyncArgs (argsFunction) {
    this.#packet.args = await argsFunction();

    if (this.#busyCallbacks.length > 0) {
      const busyCallbacks = this.#busyCallbacks;
      this.#busyCallbacks = [];

      for (const busyCallback of busyCallbacks) {
        if (typeof busyCallback !== 'function') {
          throw new Error(`Invalid busy callback ${busyCallback} for packet of type ${this.constructor.name}`);
        }

        busyCallback();
      }
    }

    this.#busy = false;
  }

  async #writePacket (connection) {
    const packetName = this.constructor.name;
    const packetTypeStr = this.#packet.type.toString();

    if (!noLogPackets.includes(packetName)) {
      log.debug(
        `Writing packet ${packetName} to connection ${connection.id}:`,
        chalk.magenta(packetTypeStr),
        this.#packet.args
      );
    }

    if (!(this.#packet.type instanceof PacketType)) {
      throw new Error(`Invalid packet type ${this.#packet.type}`);
    } else if (this.#packet.type === PacketType.NONE) {
      throw new Error('Cannot write packet of type NONE');
    } else if (this.#packet.type === PacketType.DATA) {
      this.#packet.sequenceNumber = connection.getNextSequenceNumber();
    }

    await connection.write(this.#packet.toString() + '\n');
  }

  setType (type) {
    if (type instanceof PacketType) this.#packet.type = type;
    else throw new Error(`Invalid packet type ${type}`);
  }

  write (connection) {
    return new Promise(resolve => {
      const packetName = this.constructor.name;

      if (!noLogPackets.includes(packetName)) {
        log.debug(`${packetName} write(), busy:`, this.#busy);
      }

      const writeAndResolve = async () => {
        await this.#writePacket(connection);

        resolve();
      };

      if (this.#busy) this.#busyCallbacks.push(writeAndResolve);
      else writeAndResolve();
    });
  }
}

module.exports = OutPacket;
