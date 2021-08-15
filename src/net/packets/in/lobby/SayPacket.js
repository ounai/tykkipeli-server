'use strict';

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const ChatRoomLanguage = require('../../../../db/models/ChatRoomLanguage');

const log = require('../../../../Logger')('SayPacket');

class SayPacket extends InPacket {
  type = PacketType.DATA;
  usesPlayer = true;

  match(packet) {
    return packet.startsWith('lobby', 'say');
  }

  async handle(connection, packet, player) {
    const chatRoomLanguageId = packet.getNumber(2);
    const message = packet.getString(3);

    const chatRoomLanguage = await ChatRoomLanguage.findById(chatRoomLanguageId);

    if (chatRoomLanguage) {
      log.debug('Player', player.username, `(id=${player.id}) in chat room ${chatRoomLanguage.name}:`, message);

      // TODO broadcast message
    } else {
      throw new Error(`Invalid chat room language id ${chatRoomLanguageId}`);
    }
  }
}

module.exports = SayPacket;

