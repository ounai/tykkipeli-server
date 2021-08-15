'use strict';

const { Model, DataTypes } = require('sequelize');

const columns = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true
  }
};

const rows = [
  { id: 0, name: 'NONE' },
  { id: 1, name: 'LOGIN' },
  { id: 2, name: 'LOBBY' },
  { id: 3, name: 'GAME_LOBBY' },
  { id: 4, name: 'GAME' }
];

const associated = [
  ['hasMany', 'Player', { constraints: false }]
];

class GameState extends Model {
  static get columns() {
    return columns;
  }

  static get rows() {
    return rows;
  }

  static get associated() {
    return associated;
  }

  static async findByName(name) {
    return await this.findOne({
      where: {
        name
      }
    });
  }
}

module.exports = GameState;

