'use strict';

const Event = require('../Event');
const StartTurnEvent = require('./StartTurnEvent');

const log = require('../../Logger')('ResultReceivedEvt');

class ResultReceivedEvent extends Event {
  async handle (server, game) {
    const gamePlayers = await game.getGamePlayers();

    if (gamePlayers.find(gamePlayer => !gamePlayer.turnResultsReceived)) {
      log.debug('All turn results not yet received for game', game.toColorString());

      return;
    }

    // TODO check if next round should start instead (all or all-1 players dead)

    log.debug('All turn results have been received, starting next turn in game', game.toColorString());

    new StartTurnEvent(server, game).fire();
  }
}

module.exports = ResultReceivedEvent;
