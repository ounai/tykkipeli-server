'use strict';

const Event = require('../Event');
const StartTurnEvent = require('./StartTurnEvent');
const Broadcast = require('../../net/Broadcast');
const StartRoundPacket = require('../../net/packets/out/game/StartRoundPacket');
const Game = require('../../db/models/Game');

const log = require('../../Logger')('StartRoundEvent');

class StartRoundEvent extends Event {
  async handle (server, game) {
    if (!server) throw new Error(`Invalid server ${server}`);
    if (!(game instanceof Game)) throw new Error(`Invalid game ${game}`);

    const round = await game.findCurrentRound();

    log.debug('Starting round', round.roundNumber, 'of game', game.toColorString(), 'with seed', round.mapSeed);

    server.gameHandler.resetTurn(game.id);

    // TODO add ammo as dictated by WeaponAddingMode

    new Broadcast(
      await game.getPlayers(),
      new StartRoundPacket(round.mapSeed),
      server
    ).writeAll();

    new StartTurnEvent(server, game).fire();

    round.startTime = new Date();
    await round.save();
  }
}

module.exports = StartRoundEvent;
