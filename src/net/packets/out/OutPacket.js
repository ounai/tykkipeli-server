'use strict';

const chalk = require('chalk');

const PacketType = require('../../PacketType');
const Packet = require('../../Packet');

const log = require('../../../Logger')('OutPacket');

class OutPacket {
  #packet;

  #busy = false;
  #busyCallback = null;

  constructor(...args) {
    this.#packet = new Packet();
    this.#packet.type = PacketType.DATA;
    this.#packet.args = args;
  }

  async #asyncArgs(argsFunction) {
    this.#packet.args = await argsFunction();

    if (typeof(this.#busyCallback) === 'function') {
      this.#busyCallback();
      this.#busyCallback = null;
    }

    this.#busy = false;
  }

  async #writePacket(connection) {
    log.debug(`Writing packet ${this.constructor.name}:`, chalk.magenta(this.#packet.type.name), this.#packet.args);

    if (!(this.#packet.type instanceof PacketType)) {
      throw new Error(`Invalid packet type ${this.#packet.type}`);
    } else if (this.#packet.type === PacketType.NONE) {
      throw new Error('Cannot write packet of type NONE');
    } else if (this.#packet.type === PacketType.DATA) {
      this.#packet.sequenceNumber = connection.nextSequenceNumber;
    }

    await connection.write(this.#packet.toString() + '\n');
  }

  setType(type) {
    if (type instanceof PacketType) this.#packet.type = type;
    else throw new Error(`Invalid packet type ${type}`);
  }

  asyncArgs(argsFunction) {
    this.#busy = true;

    this.#asyncArgs(argsFunction);
  }

  write(connection) {
    return new Promise(resolve => {
      log.debug(`${this.constructor.name} write(), busy:`, this.#busy);

      const writeAndResolve = async () => {
        await this.#writePacket(connection);

        resolve();
      };

      if (this.#busy) this.#busyCallback = writeAndResolve;
      else writeAndResolve();
    });
  }
}

module.exports = OutPacket;

