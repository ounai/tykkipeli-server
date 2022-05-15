'use strict';

const OutPacket = require('../OutPacket');
const Action = require('../../../../db/models/Action');

class ActionPacket extends OutPacket {
  constructor (action) {
    if (!(action instanceof Action)) throw new Error(`Invalid action ${action}`);

    super('game', 'action', action.GamePlayerId, action.getActionString());
  }
}

module.exports = ActionPacket;
