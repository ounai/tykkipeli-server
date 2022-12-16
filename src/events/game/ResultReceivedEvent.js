'use strict';

const TurnState = require('../../game/TurnState');
const Event = require('../Event');
const StartTurnEvent = require('./StartTurnEvent');
const EndRoundEvent = require('./EndRoundEvent');

const log = require('../../Logger')('ResultReceivedEvt');

class ResultReceivedEvent extends Event {
  async handle (server, game) {
    const { result, resultsCount } = server.gameHandler.getTurn(game.id);

    const playerCount = await game.getPlayerCount();
    const health = result.slice(0, playerCount);
    const alivePlayerCount = health.filter(h => h > 0).length;

    if (resultsCount === playerCount) {
      if (server.gameHandler.getTurn(game.id).setTurnState(TurnState.FINISHED)) {
        if (alivePlayerCount > 1) {
          // Next turn
          log.debug('All turn results have been received, starting next turn in game', game.toColorString());

          new StartTurnEvent(server, game).fire();
        } else {
          // End round
          log.debug('All turn results have been received, ending current round in game', game.toColorString());

          const winnerGamePlayerId = (alivePlayerCount === 1)
            ? health.findIndex(h => h > 0)
            : -1;

          new EndRoundEvent(server, game, winnerGamePlayerId).fire();
        }
      }
    } else {
      log.debug('All turn results not yet received for game', game.toColorString());
    }
  }
}

module.exports = ResultReceivedEvent;
