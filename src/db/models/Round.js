'use strict';

const { Model, DataTypes } = require('sequelize');

const columns = {
  GameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  roundNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  mapSeed: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
};

const associated = [
  ['belongsTo', 'Game']
];

class Round extends Model {
  static get columns () {
    return columns;
  }

  static get associated () {
    return associated;
  }
}

module.exports = Round;
