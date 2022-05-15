'use strict';

const { Model, DataTypes } = require('sequelize');

const columns = {
  GamePlayerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  TurnId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  resultData: {
    type: DataTypes.TEXT,
    allowNull: false
  }
};

const associated = [
  ['belongsTo', 'GamePlayer'],
  ['belongsTo', 'Turn']
];

class Result extends Model {
  static get columns () {
    return columns;
  }

  static get associated () {
    return associated;
  }
}

module.exports = Result;
