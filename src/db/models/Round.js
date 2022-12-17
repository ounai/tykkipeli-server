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
    primaryKey: true,
    validate: {
      min: 1,
      max: 20
    }
  },
  mapSeed: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  startTime: {
    // Starts out at null because of the rounds being created ahead of time
    // Should be set to current time at the start of a round
    type: DataTypes.DATE,
    defaultValue: null
  },
  endTime: {
    type: DataTypes.DATE,
    defaultValue: null
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
