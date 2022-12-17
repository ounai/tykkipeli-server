'use strict';

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const ActionSubmittedEvent = require('../../../../events/game/ActionSubmittedEvent');
const Action = require('../../../../game/Action');
const Ammo = require('../../../../db/models/Ammo');

const log = require('../../../../Logger')('ActionPacket');

class ActionPacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('game', 'action');
  }

  #noAction (game, player, gamePlayer) {
    log.debug('Player', player.toColorString(), 'submitted no action');

    this.server.gameHandler.getTurn(game.id).addAction(gamePlayer.id, Action.NONE);
  }

  #shieldAction (game, player, gamePlayer) {
    log.debug('Player', player.toColorString(), 'submitted shield action');

    this.server.gameHandler.getTurn(game.id).addAction(gamePlayer.id, Action.SHIELD);
  }

  async #targetedAction (game, player, gamePlayer, actionId, packet) {
    // TODO check that player's ammo is sufficient, if not do this.#noAction()
    // TODO decrement ammo if action id is not 0

    if (actionId !== 0) {
      const ammo = await Ammo.findOne({
        where: {
          slotId: actionId,
          GameId: game.id,
          GamePlayerId: gamePlayer.id
        }
      });

      if (ammo.count > 0) {
        ammo.count--;

        await ammo.save();
      } else {
        log.debug('Player', player.toColorString(), 'submitted action', actionId, 'with insufficient ammo');

        return this.#noAction(game, player, gamePlayer);
      }
    }

    // Launch position: the position on screen towards which the projectile is launched
    const launchScreenX = packet.getNumber(3);
    const launchScreenY = packet.getNumber(4);

    // Target position: the final target of a self-targeting weapon
    // For most weapons these will be -1
    const targetScreenX = packet.getNumber(5);
    const targetScreenY = packet.getNumber(6);

    log.debug(
      'Player',
      player.toColorString(),
      'submitted action',
      actionId,
      `at (${launchScreenX}, ${launchScreenY})`,
      (targetScreenX !== -1 ? `with final target at (${targetScreenX}, ${targetScreenY})` : '')
    );

    const action = new Action(actionId, launchScreenX, launchScreenY, targetScreenX, targetScreenY);

    this.server.gameHandler.getTurn(game.id).addAction(gamePlayer.id, action);
  }

  async handle (connection, packet) {
    const player = await connection.getPlayer();
    const gamePlayer = await player.getGamePlayer();
    const game = await player.getGame();

    const actionId = packet.getNumber(2);

    if (actionId === Action.NONE.valueOf()) {
      this.#noAction(game, player, gamePlayer);
    } else if (actionId === Action.SHIELD.valueOf()) {
      this.#shieldAction(game, player, gamePlayer);
    } else {
      // Projectile or teleport
      await this.#targetedAction(game, player, gamePlayer, actionId, packet);
    }

    new ActionSubmittedEvent(this.server, game).fire();
  }
}

module.exports = ActionPacket;
