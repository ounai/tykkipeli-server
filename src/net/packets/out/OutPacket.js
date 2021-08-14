'use strict';

const PacketType = require('../../PacketType');
const Packet = require('../../Packet');

const log = require('../../../Logger')('OutPacket');

class OutPacket {
  #packet;

  constructor(...args) {
    this.#packet = new Packet();
    this.#packet.type = PacketType.DATA;
    this.#packet.args = args;
  }

  setType(type) {
    // TODO validate type
    this.#packet.type = type;
  }

  async write(connection) {
    log.debug(`Writing packet ${this.constructor.name}:`, this.#packet.type, this.#packet.args);

    await connection.writePacket(this.#packet);
  }
}

module.exports = OutPacket;

