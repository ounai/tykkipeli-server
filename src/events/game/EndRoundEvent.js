'use strict';

const Broadcast = require('../../net/Broadcast');
const EndRoundPacket = require('../../net/packets/out/game/EndRoundPacket');
const Event = require('../Event');
const StartRoundEvent = require('./StartRoundEvent');
const EndGameEvent = require('./EndGameEvent');

const log = require('../../Logger')('EndRoundEvent');

class EndRoundEvent extends Event {
  async handle (server, game, winnerGamePlayerId) {
    const round = await game.findCurrentRound();

    new Broadcast(
      await game.getPlayers(),
      new EndRoundPacket(round.roundNumber, winnerGamePlayerId),
      server
    ).writeAll();

    round.endTime = new Date();
    round.save();

    if (game.currentRoundNumber < game.roundCount) {
      log.debug('Starting next round in game', game.toColorString());

      game.currentRoundNumber++;
      await game.save();

      new StartRoundEvent(server, game).fire();
    } else {
      log.debug('End of last round in game', game.toColorString());

      new EndGameEvent(server, game).fire();
    }
  }
}

module.exports = EndRoundEvent;
