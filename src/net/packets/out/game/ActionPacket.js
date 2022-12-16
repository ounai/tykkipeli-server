'use strict';

const OutPacket = require('../OutPacket');
const Action = require('../../../../game/Action');

class ActionPacket extends OutPacket {
  constructor (gamePlayerId, action) {
    if (typeof gamePlayerId !== 'number') throw new Error(`Invalid game player id ${gamePlayerId}`);
    if (!(action instanceof Action)) throw new Error(`Invalid action ${action}`);

    super('game', 'action', gamePlayerId, action.getActionString());
  }
}

module.exports = ActionPacket;
