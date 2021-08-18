'use strict';

const PacketType = require('../../PacketType');
const InPacket = require('./InPacket');

class LanguagePacket extends InPacket {
  type = PacketType.DATA;

  match(packet) {
    return packet.startsWith('language');
  }

  async handle(connection, packet) {
    const locale = packet.getString(1);

    if (locale.length !== 5) {
      throw new Error(`Invalid locale ${locale}`);
    }

    (await connection.getPlayer()).setLocale(locale);
  }
}

module.exports = LanguagePacket;

