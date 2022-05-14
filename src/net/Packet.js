'use strict';

const PacketType = require('./PacketType');

class Packet {
  type;

  #args;
  #sequenceNumber = null;

  #serializeDataPacket () {
    if (typeof this.#sequenceNumber !== 'number' || isNaN(this.#sequenceNumber)) {
      throw new Error(`Cannot serialize data packet, invalid sequence number ${this.#sequenceNumber}!`);
    }

    return [
      PacketType.DATA.valueOf(),
      this.#sequenceNumber,
      this.args.join('\t')
    ].join(' ');
  }

  #serializeCommandPacket () {
    if (typeof this.args !== 'object' || this.args.length === 0) {
      throw new Error('Cannot serialize command packet, no args!');
    }

    return [
      PacketType.COMMAND.valueOf(),
      ...this.args
    ].join(' ');
  }

  #deserializeDataPacket (packet) {
    const splitPacket = packet.split(' ');

    if (splitPacket.length < 3) {
      throw new Error(`Cannot deserialize data packet ${packet}, invalid length ${splitPacket.length}!`);
    }

    const parsedSequenceNumber = Number(splitPacket[1]);

    if (parsedSequenceNumber < 0 || isNaN(parsedSequenceNumber)) {
      throw new Error(`Cannot deserialize data packet ${packet}, invalid sequence number ${parsedSequenceNumber}!`);
    } else {
      this.#sequenceNumber = parsedSequenceNumber;
    }

    this.args = splitPacket.slice(2).join(' ').split('\t');
  }

  #cleanArgs () {
    this.args = this.args.map(arg => arg.replace(/\r/g, '').replace(/\n/g, ''));
  }

  #serialize () {
    if (this.type === PacketType.DATA) {
      return this.#serializeDataPacket();
    } else if (this.type === PacketType.COMMAND) {
      return this.#serializeCommandPacket();
    } else {
      throw new Error(`Cannot serialize packet, invalid type ${this.type}!`);
    }
  }

  #deserialize (packet) {
    this.type = PacketType.get(packet[0]);

    if (this.type === PacketType.DATA) {
      this.#deserializeDataPacket(packet);
    } else if (this.type === PacketType.COMMAND) {
      this.args = packet.split(' ').slice(1);
    } else if (this.type === PacketType.STRING) {
      this.args = packet.split(' ')[1].split('\t');
    } else {
      throw new Error(`Cannot deserialize packet, invalid type ${this.type}!`);
    }

    this.#cleanArgs();
  }

  constructor (packet, type = PacketType.NONE) {
    this.type = type;

    if (typeof packet === 'string') {
      if (packet.length > 0) this.#deserialize(packet);
    } else if (Array.isArray(packet) && packet.length > 0) {
      this.args = packet;
    } else if (packet !== null && packet !== undefined) {
      throw new Error(`Invalid packet ${packet}`);
    }
  }

  get args () {
    return this.#args;
  }

  set args (args) {
    if (!Array.isArray(args)) {
      throw new Error(`Invalid args, not an array: ${args}`);
    }

    for (const arg of args) {
      if (!['string', 'number'].includes(typeof arg)) {
        throw new Error(`Invalid arg ${arg} (type ${typeof arg}`);
      }
    }

    this.#args = args;
  }

  set sequenceNumber (sequenceNumber) {
    if (this.type !== PacketType.DATA) {
      throw new Error(`Cannot set sequence number, unsupported for packets of type ${this.type}!`);
    }

    if (typeof sequenceNumber !== 'number' || isNaN(sequenceNumber)) {
      throw new Error(`Cannot set sequence number, invalid number ${sequenceNumber}!`);
    }

    this.#sequenceNumber = sequenceNumber;
  }

  get sequenceNumber () {
    return this.#sequenceNumber;
  }

  toString () {
    return this.#serialize();
  }

  startsWith (...str) {
    const argsJoined = this.args.join(' ');
    const strJoined = str.join(' ');

    return (argsJoined === strJoined || argsJoined.startsWith(strJoined + ' '));
  }

  getString (pos) {
    if (!Array.isArray(this.args) || this.args.length < pos) {
      throw new Error(`Cannot get arg ${pos}`);
    }

    return this.args[pos];
  }

  getNumber (pos) {
    const n = Number(this.getString(pos));

    if (typeof n !== 'number' || isNaN(n)) {
      throw new Error(`Invalid number at ${pos}: ${n}`);
    }

    return n;
  }
}

module.exports = Packet;
