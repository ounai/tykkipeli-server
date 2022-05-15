'use strict';

const { Model, DataTypes } = require('sequelize');

const columns = {
  RoundId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  executed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
};

const associated = [
  ['hasMany', 'Action'],
  ['hasMany', 'Result'],
  ['belongsTo', 'Round']
];

class Turn extends Model {
  static get columns () {
    return columns;
  }

  static get associated () {
    return associated;
  }
}

module.exports = Turn;
