'use strict';

const { Model, DataTypes, Op } = require('sequelize');

const Ammo = require('./Ammo');

const columns = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  PlayerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  GameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  isReadyToStart: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
};

const associated = [
  ['hasMany', 'Ammo'],
  ['belongsTo', 'Player'],
  ['belongsTo', 'Game']
];

class GamePlayer extends Model {
  static get columns () {
    return columns;
  }

  static get associated () {
    return associated;
  }

  async findOthersInGame () {
    return await GamePlayer.findAll({
      where: {
        GameId: this.GameId,
        PlayerId: {
          [Op.not]: this.PlayerId
        }
      }
    });
  }

  async getAmmoString () {
    const ammos = await Ammo.findAll({
      where: {
        GameId: this.GameId,
        GamePlayerId: this.id
      }
    });

    return ammos
      .map(ammo => ammo.count)
      .join('\t');
  }
}

module.exports = GamePlayer;
