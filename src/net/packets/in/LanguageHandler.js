'use strict';

const PacketType = require('../../PacketType');

class LanguageHandler {
  usesPlayer = true;

  match(packet) {
    return (
      packet.type === PacketType.DATA
      && packet.startsWith('language')
    );
  }

  handle(connection, packet, player) {
    const language = packet.getString(1);

    if (language.length !== 5) {
      throw new Error(`Invalid language ${language}`);
    }

    player.setLanguage(language);
  }
}

module.exports = LanguageHandler;

