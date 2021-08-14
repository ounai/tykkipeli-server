'use strict';

const { Model, DataTypes } = require('sequelize');

const log = require('../../Logger')('Player');

const model = {
  gameState: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  connected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  disconnectedAt: DataTypes.DATE,
  language: DataTypes.STRING(5),
  isRegistered: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  accessLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  creditAmount: {
    type: DataTypes.INTEGER,
    allowNulll: false,
    defaultValue: 0
  },
  badWordFilterEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  emailConfirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
};

class Player extends Model {
  static get model() {
    return model;
  }

  static findById(id) {
    return this.findByPk(id);
  }

  static destroyById(id) {
    return this.destroy({
      where: { id }
    });
  }

  static countConnected() {
    return this.count({
      where: {
        connected: true
      }
    });
  }

  setConnected(connected) {
    log.debug('Player', this.id, 'set connected:', connected);

    this.connected = connected;
    this.disconnectedAt = (connected ? null : new Date());

    this.save();
  }

  setLanguage(language) {
    log.debug('Player', this.id, 'set language:', language);

    this.language = language;

    this.save();
  }
}

module.exports = Player;

