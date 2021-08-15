'use strict';

const { Model, DataTypes } = require('sequelize');

const columns = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  language: {
    type: DataTypes.STRING(16),
    allowNull: false
  }
};

const rows = [
  { id: 0, language: 'UNKNOWN' },
  { id: 1, language: 'BULGARIA' },
  { id: 2, language: 'GERMANY' },
  { id: 3, language: 'UNITED_KINGDOM' },
  { id: 4, language: 'SPAIN' },
  { id: 5, language: 'ESTONIA' },
  { id: 6, language: 'FINLAND' },
  { id: 7, language: 'FRANCE' },
  { id: 8, language: 'HUNGARY' },
  { id: 9, language: 'ITALY' },
  { id: 10, language: 'LATVIA' },
  { id: 11, language: 'NETHERLANDS' },
  { id: 12, language: 'NORWAY' },
  { id: 13, language: 'POLAND' },
  { id: 14, language: 'PORTUGAL' },
  { id: 15, language: 'ROMANIA' },
  { id: 16, language: 'RUSSIA' },
  { id: 17, language: 'SWEDEN' },
  { id: 18, language: 'TURKEY' },
  { id: 19, language: 'LITHUANIA' },
];

class ChatRoomLanguage extends Model {
  static get columns() {
    return columns;
  }

  static get rows() {
    return rows;
  }
}

module.exports = ChatRoomLanguage;

