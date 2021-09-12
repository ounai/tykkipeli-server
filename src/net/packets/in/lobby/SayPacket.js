'use strict';

const chalk = require('chalk');

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const ChatRoomLanguage = require('../../../../db/models/ChatRoomLanguage');
const OutSayPacket = require('../../out/lobby/SayPacket');
const Broadcast = require('../../../Broadcast');

const log = require('../../../../Logger')('SayPacket');

class SayPacket extends InPacket {
  type = PacketType.DATA;

  match(packet) {
    return packet.startsWith('lobby', 'say');
  }

  async handle(connection, packet) {
    const message = packet.getString(3);

    if (typeof(message) !== 'string' || message.length === 0) throw new Error(`Invalid chat message ${message}`);

    const chatRoomLanguageId = packet.getNumber(2);
    const chatRoomLanguage = await ChatRoomLanguage.findById(chatRoomLanguageId);

    if (chatRoomLanguage) {
      const player = await connection.getPlayer();

      log.debug('Player', chalk.magenta(player.toString()), `in chat room ${chatRoomLanguage.name}:`, chalk.cyan(message));

      const otherPlayers = await player.findOthersByGameState('LOBBY');
      const broadcastPacket = new OutSayPacket(chatRoomLanguage, player.username, message);

      new Broadcast(otherPlayers, broadcastPacket, this.server).writeAll();
    } else {
      throw new Error(`Invalid chat room language id ${chatRoomLanguageId}`);
    }
  }
}

module.exports = SayPacket;

