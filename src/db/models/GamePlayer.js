'use strict';

const { Model, DataTypes } = require('sequelize');

const columns = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  PlayerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  GameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  }
};

const associated = [
  ['belongsTo', 'Player'],
  ['belongsTo', 'Game']
];

class GamePlayer extends Model {
  static get columns() {
    return columns;
  }

  static get associated() {
    return associated;
  }
}

module.exports = GamePlayer;

