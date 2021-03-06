'use strict';

const packetTypes = {};

class PacketType {
  static NONE = new PacketType('NONE', '-');
  static DATA = new PacketType('DATA', 'd');
  static COMMAND = new PacketType('COMMAND', 'c');
  static STRING = new PacketType('STRING', 's');
  static HANDSHAKE = new PacketType('HANDSHAKE', 'h');

  #name;
  #code;

  static get (code) {
    return packetTypes[code] || null;
  }

  constructor (name, code) {
    this.#name = name;
    this.#code = code;

    packetTypes[code] = this;
  }

  toString () {
    return `PacketType.${this.#name}`;
  }

  valueOf () {
    return this.#code;
  }
}

module.exports = PacketType;
