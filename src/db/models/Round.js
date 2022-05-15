'use strict';

const { Model, DataTypes } = require('sequelize');

const columns = {
  GameId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  roundNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
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
  }
};

const associated = [
  ['hasMany', 'Turn'],
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
