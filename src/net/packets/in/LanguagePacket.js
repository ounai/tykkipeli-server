'use strict';

const PacketType = require('../../PacketType');
const InPacket = require('./InPacket');

class LanguagePacket extends InPacket {
  type = PacketType.DATA;
  usesPlayer = true;

  match(packet) {
    return packet.startsWith('language');
  }

  handle(connection, packet, player) {
    const locale = packet.getString(1);

    if (locale.length !== 5) {
      throw new Error(`Invalid locale ${locale}`);
    }

    player.setLocale(locale);
  }
}

module.exports = LanguagePacket;

