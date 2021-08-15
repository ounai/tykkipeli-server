'use strict';

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

  setType(type) {
    // TODO validate type
    this.#packet.type = type;
  }

  async #asyncArgs(argsFunction) {
    this.#packet.args = await argsFunction();

    if (typeof(this.#busyCallback) === 'function') {
      this.#busyCallback();
      this.#busyCallback = null;
    }

    this.#busy = false;
  }

  asyncArgs(argsFunction) {
    this.#busy = true;

    this.#asyncArgs(argsFunction);
  }

  async #write(connection) {
    log.debug(`Writing packet ${this.constructor.name}:`, this.#packet.type, this.#packet.args);

    await connection.writePacket(this.#packet);
  }

  write(connection) {
    log.debug(`${this.constructor.name} write(), busy:`, this.#busy);

    if (this.#busy) this.#busyCallback = () => this.#write(connection);
    else this.#write(connection);
  }
}

module.exports = OutPacket;

