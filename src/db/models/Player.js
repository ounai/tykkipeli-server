'use strict';

const { Model, DataTypes, Op } = require('sequelize');

const GameState = require('./GameState');

const { getRandomInt } = require('../../Utils');

const columns = {
  username: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    defaultValue: () => `~anonym-${getRandomInt(9000) + 1000}`
  },
  isConnected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  disconnectedAt: DataTypes.DATE,
  locale: {
    type: DataTypes.STRING(5),
    allowNull: false,
    defaultValue: 'en_US'
  },
  language: {
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: 'en'
  },
  isRegistered: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isVip: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  accessLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  creditAmount: {
    type: DataTypes.INTEGER,
    allowNulll: false,
    defaultValue: 0
  },
  badWordFilterEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  emailConfirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  ranking: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
};

const associated = [
  ['belongsTo', 'GameState'],
  ['hasOne', 'GamePlayer']
];

class Player extends Model {
  static get columns() {
    return columns;
  }

  static get associated() {
    return associated;
  }

  static async findById(id) {
    return await this.findByPk(id);
  }

  static async destroyById(id) {
    return await this.destroy({
      where: { id }
    });
  }

  static async countConnected() {
    return await this.count({
      where: {
        isConnected: true
      }
    });
  }

  static async destroyOldDisconnectedPlayers(tresholdDate = null) {
    if (tresholdDate === null) {
      // Default to one hour ago
      tresholdDate = new Date();
      tresholdDate.setHours(tresholdDate.getGetHours() - 1);
    }

    return await this.destroy({
      where: {
        isConnected: false,
        disconnectedAt: {
          [Op.lt]: tresholdDate
        }
      }
    });
  }

  static async countByGameState(...gameStateNames) {
    return await this.count({
      where: {
        '$GameState.name$': gameStateNames
      },
      include: GameState
    });
  }

  static async isUsernameInUse(username) {
    return !!(await this.findOne({
      where: {
        username
      }
    }));
  }

  #getUserInfoFlags() {
    const flags = {
      'r': this.isRegistered,
      'v': this.isVip,
      's': this.accessLevel >= 1 // sheriff
    };

    return (
      Object.entries(flags)
        .filter(([flag, enabled]) => typeof(flag) === 'string' && flag.length === 1 && enabled)
        .map(([flag]) => flag)
        .join('')
    );
  }

  getUserInfoString(version) {
    if (version === 3) {
      const flags = this.#getUserInfoFlags();

      const userInfo = [
        this.username,
        (flags.length === 0 ? '-' : flags),
        this.ranking,
        this.language,
        '-', // TODO unknown
        '-'  // TODO unknown 2: electric boogaloo
      ];

      return '3:' + userInfo.join('^');
    } else {
      throw new Error(`Invalid user info string version ${version}`);
    }
  }

  async countOthersByGameState(...gameStateNames) {
    return await Player.count({
      where: {
        id: {
          [Op.not]: this.id
        },
        '$GameState.name$': gameStateNames
      },
      include: GameState
    });
  }

  async setConnected(connected) {
    this.isConnected = connected;
    this.disconnectedAt = (connected ? null : new Date());

    await this.save();
  }

  async setLocale(locale) {
    const language = locale.slice(0, 2);

    this.locale = locale;
    this.language = language;

    await this.save();
  }

  async setRegistered(registered) {
    this.isRegistered = registered;

    await this.save();
  }

  async setUsername(username) {
    this.username = username;

    await this.save();
  }
}

module.exports = Player;

