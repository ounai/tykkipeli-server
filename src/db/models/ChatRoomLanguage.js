'use strict';

const { Model, DataTypes } = require('sequelize');

const columns = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(2),
    unique: true
  },
  name: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true
  }
};

const rows = [
  { id:  0, code: null, name: 'UNKNOWN' },
  { id:  1, code: 'bg', name: 'BULGARIA' },
  { id:  2, code: 'de', name: 'GERMANY' },
  { id:  3, code: 'en', name: 'UNITED_KINGDOM' },
  { id:  4, code: 'es', name: 'SPAIN' },
  { id:  5, code: 'et', name: 'ESTONIA' },
  { id:  6, code: 'fi', name: 'FINLAND' },
  { id:  7, code: 'fr', name: 'FRANCE' },
  { id:  8, code: 'hu', name: 'HUNGARY' },
  { id:  9, code: 'it', name: 'ITALY' },
  { id: 10, code: 'lv', name: 'LATVIA' },
  { id: 11, code: 'nl', name: 'NETHERLANDS' },
  { id: 12, code: 'no', name: 'NORWAY' },
  { id: 13, code: 'pl', name: 'POLAND' },
  { id: 14, code: 'pt', name: 'PORTUGAL' },
  { id: 15, code: 'ro', name: 'ROMANIA' },
  { id: 16, code: 'ru', name: 'RUSSIA' },
  { id: 17, code: 'sv', name: 'SWEDEN' },
  { id: 18, code: 'tr', name: 'TURKEY' },
  { id: 19, code: 'lt', name: 'LITHUANIA' },
];

class ChatRoomLanguage extends Model {
  static get columns() {
    return columns;
  }

  static get rows() {
    return rows;
  }

  static async findById(id) {
    return await this.findByPk(id);
  }
}

module.exports = ChatRoomLanguage;

