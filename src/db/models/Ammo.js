'use strict';

const { Model, DataTypes } = require('sequelize');

const columns = {
  slotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  GameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  GamePlayerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  count: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  }
};

const associated = [
  ['belongsTo', 'GamePlayer']
];

class Ammo extends Model {
  static get columns () {
    return columns;
  }

  static get associated () {
    return associated;
  }
}

module.exports = Ammo;
