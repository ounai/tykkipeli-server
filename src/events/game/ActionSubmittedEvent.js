'use strict';

const { Op } = require('sequelize');

const Event = require('../Event');
const Broadcast = require('../../net/Broadcast');
const ActionPacket = require('../../net/packets/out/game/ActionPacket');
const StartActionPacket = require('../../net/packets/out/game/StartActionPacket');

const log = require('../../Logger')('ActionSubmittedEvt');

class ActionSubmittedEvent extends Event {
  async handle (server, game) {
    const round = await game.findCurrentRound();
    const actions = await round.getActions();

    log.debug(
      `Actions so far for game ${game.toColorString()}:`,
      actions.map(a => a.toJSON())
    );

    // TODO it should also be somehow checked if round thinking time has elapsed
    if (actions.length === await game.getPlayerCount()) {
      log.debug('All turn actions are in for game', game.toColorString());

      const players = await game.getPlayers();

      for (const player of players) {
        const connection = server.connectionHandler.getPlayerConnection(player);

        const where = {
          GamePlayerId: {
            [Op.not]: (await player.getGamePlayer()).id
          }
        };

        // Send every action packet except the player's own
        for (const action of await round.getActions({ where })) {
          new ActionPacket(action).write(connection);
        }
      }

      new Broadcast(players, new StartActionPacket(), server).writeAll();
    } else {
      log.debug('Turn actions not yet finished for game', game.toColorString());
    }
  }
}

module.exports = ActionSubmittedEvent;
