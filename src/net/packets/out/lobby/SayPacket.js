'use strict';

const OutPacket = require('../OutPacket');
const ChatRoomLanguage = require('../../../../db/models/ChatRoomLanguage');

class SayPacket extends OutPacket {
  constructor(chatRoomLanguage, username, message) {
    if (!(chatRoomLanguage instanceof ChatRoomLanguage)) {
      throw new Error(`Invalid chat room language ${chatRoomLanguage}`);
    }

    if (typeof(username) !== 'string' || username.length === 0) {
      throw new Error(`Invalid username ${username}`);
    }

    if (typeof(message) !== 'string' || message.length === 0) {
      throw new Error(`Invalid message ${message}`);
    }

    super('lobby', 'say', chatRoomLanguage.id, username, message);
  }
}

module.exports = SayPacket;

