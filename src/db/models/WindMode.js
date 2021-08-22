'use strict';

const { Model, DataTypes } = require('sequelize');

const columns = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true
  }
};

const rows = [
  { id: 0, name: 'NONE' },
  { id: 1, name: 'NORMAL' },
  { id: 2, name: 'RANDOM' }
];

const associated = [
  ['hasMany', 'Game']
];

class WindMode extends Model {
  static get columns() {
    return columns;
  }

  static get rows() {
    return rows;
  }

  static get associated() {
    return associated;
  }

  static async findById(id) {
    return await this.findByPk(id);
  }
}

module.exports = WindMode;

