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
  { id: -1, name: 'DECREASING' },
  { id:  0, name: 'CONSTANT' },
  { id:  1, name: 'INCREASING' }
];

const associated = [
  ['hasMany', 'Game']
];

class WeaponAddingMode extends Model {
  static get columns() {
    return columns;
  }

  static get rows() {
    return rows;
  }

  static get associated() {
    return associated;
  }
}

module.exports = WeaponAddingMode;

