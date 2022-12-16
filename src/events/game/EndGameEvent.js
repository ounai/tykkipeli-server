'use strict';

const Event = require('../Event');
const Broadcast = require('../../net/Broadcast');
const EndGamePacket = require('../../net/packets/out/game/EndGamePacket');

const log = require('../../Logger')('EndGameEvent');

class EndGameEvent extends Event {
  async handle (server, game) {
    log.info('Game', game.toColorString(), 'has ended!');

    new Broadcast(await game.getPlayers(), new EndGamePacket(), server).writeAll();
  }
}

module.exports = EndGameEvent;
