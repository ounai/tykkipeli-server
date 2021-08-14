'use strict';

const { Model, DataTypes } = require('sequelize');

const model = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(16),
    allowNull: false
  }
};

const rows = [
  { id: 0, name: 'NONE' },
  { id: 1, name: 'LOGIN' },
  { id: 2, name: 'LOBBY' },
  { id: 3, name: 'GAME_LOBBY' },
  { id: 4, name: 'GAME' }
];

class GameState extends Model {
  static get model() {
    return model;
  }

  static get rows() {
    return rows;
  }
}

module.exports = GameState;

