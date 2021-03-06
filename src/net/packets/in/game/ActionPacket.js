'use strict';

const InPacket = require('../InPacket');
const PacketType = require('../../../PacketType');
const Action = require('../../../../db/models/Action');
const ActionSubmittedEvent = require('../../../../events/game/ActionSubmittedEvent');

const log = require('../../../../Logger')('ActionPacket');

class ActionPacket extends InPacket {
  type = PacketType.DATA;

  match (packet) {
    return packet.startsWith('game', 'action');
  }

  async #noAction (game, player, gamePlayer) {
    log.debug('Player', player.toColorString(), 'submitted no action');

    const action = await Action.create({
      GamePlayerId: gamePlayer.id,
      RoundId: (await game.findCurrentRound()).id,
      actionTypeId: -1 // TODO get from action type enum
    });

    log.debug('Created null action:', action.toJSON());
  }

  async #shieldAction (game, player, gamePlayer) {
    log.debug('Player', player.toColorString(), 'submitted shield action');

    const action = await Action.create({
      GamePlayerId: gamePlayer.id,
      RoundId: (await game.findCurrentRound()).id,
      actionTypeId: 16 // TODO get from action type enum
    });

    log.debug('Created shield action:', action.toJSON());
  }

  async #targetedAction (game, player, gamePlayer, actionTypeId, packet) {
    // TODO check if player has already submitted an action for this turn
    // TODO check that player's ammo is sufficient, if not do this.#noAction()
    // TODO decrement ammo if action id is not 0

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
      actionTypeId,
      `at (${launchScreenX}, ${launchScreenY})`,
      (targetScreenX !== -1 ? `with final target at (${targetScreenX}, ${targetScreenY})` : '')
    );

    const action = await Action.create({
      GamePlayerId: gamePlayer.id,
      RoundId: (await game.findCurrentRound()).id,
      actionTypeId,
      launchScreenX,
      launchScreenY,
      targetScreenX,
      targetScreenY
    });

    log.debug('Created targeted action:', action.toJSON());
  }

  async handle (connection, packet) {
    const player = await connection.getPlayer();
    const gamePlayer = await player.getGamePlayer();
    const game = await player.getGame();

    const actionTypeId = packet.getNumber(2);

    // TODO enum action types
    if (actionTypeId === -1) {
      // No action
      await this.#noAction(game, player, gamePlayer);
    } else if (actionTypeId === 16) {
      // Shield
      await this.#shieldAction(game, player, gamePlayer);
    } else {
      // Projectile or teleport
      await this.#targetedAction(game, player, gamePlayer, actionTypeId, packet);
    }

    new ActionSubmittedEvent(this.server, game).fire();
  }
}

module.exports = ActionPacket;
