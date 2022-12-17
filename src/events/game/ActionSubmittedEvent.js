'use strict';

const Event = require('../Event');
const Broadcast = require('../../net/Broadcast');
const ActionPacket = require('../../net/packets/out/game/ActionPacket');
const StartActionPacket = require('../../net/packets/out/game/StartActionPacket');
const TurnState = require('../../game/TurnState');

const log = require('../../Logger')('ActionSubmittedEvt');

class ActionSubmittedEvent extends Event {
  async handle (server, game) {
    const actions = server.gameHandler.getTurn(game.id).actions;

    let alivePlayerCount = await game.getPlayerCount();

    if (server.gameHandler.hasActiveTurn(game.id)) {
      const lastTurnResult = server.gameHandler.getTurn(game.id).result;

      if (lastTurnResult) {
        const health = lastTurnResult.slice(0, game.startingPlayers);

        alivePlayerCount = (await game.getGamePlayers()).filter(gamePlayer => health[gamePlayer.id] > 0).length;
      }
    }

    log.debug(actions.size, 'actions so far for game', game.toColorString());

    // TODO it should also be somehow checked if round thinking time has elapsed
    if (actions.size === alivePlayerCount) {
      if (server.gameHandler.getTurn(game.id).setTurnState(TurnState.RESULTS)) {
        log.debug('All turn actions are in for game', game.toColorString());

        const players = await game.getPlayers();

        for (const player of players) {
          const connection = server.connectionHandler.getPlayerConnection(player);

          // Send every action packet except the player's own
          for (const [gamePlayerId, action] of actions) {
            if (gamePlayerId !== (await player.getGamePlayer()).id) {
              new ActionPacket(gamePlayerId, action).write(connection);
            }
          }
        }

        new Broadcast(players, new StartActionPacket(), server).writeAll();
      }
    } else {
      log.debug('Turn actions not yet finished for game', game.toColorString());
    }
  }
}

module.exports = ActionSubmittedEvent;
