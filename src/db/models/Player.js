'use strict';

const { Model, DataTypes, Op } = require('sequelize');

const GameState = require('./GameState');

const { getRandomInt } = require('../../utils');
const log = require('../../Logger')('Player');

const columns = {
  username: {
    type: DataTypes.STRING(32),
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
  ['belongsTo', 'GameState', { constraints: false }]
];

class Player extends Model {
  static get columns() {
    return columns;
  }

  static get associated() {
    return associated;
  }

  static findById(id) {
    return this.findByPk(id);
  }

  static destroyById(id) {
    return this.destroy({
      where: { id }
    });
  }

  static countConnected() {
    return this.count({
      where: {
        isConnected: true
      }
    });
  }

  static destroyOldDisconnectedPlayers(tresholdDate = null) {
    if (tresholdDate === null) {
      // Default to one hour ago
      tresholdDate = new Date();
      tresholdDate.setHours(tresholdDate.getGetHours() - 1);
    }

    return this.destroy({
      where: {
        isConnected: false,
        disconnectedAt: {
          [Op.lt]: tresholdDate
        }
      }
    });
  }

  static countByGameState(...gameStateNames) {
    return this.count({
      where: {
        '$GameState.name$': gameStateNames
      },
      include: GameState
    });
  }

  #getUserInfoFlags() {
    const flags = {
      'r': this.isRegistered,
      'v': this.isVip,
      's': this.accessLevel >= 1 // sheriff
    };

    return (
      Object.entries(flags)
        .filter(([flag, enabled]) => enabled)
        .map(([flag, enable]) => flag)
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

  setConnected(connected) {
    log.debug('Player', this.id, 'set connected:', connected);

    this.isConnected = connected;
    this.disconnectedAt = (connected ? null : new Date());

    this.save();
  }

  setLocale(locale) {
    const language = locale.slice(0, 2);
    log.debug('Player', this.id, 'set locale:', locale, 'and language:', language);

    this.locale = locale;
    this.language = language;

    this.save();
  }

  setRegistered(registered) {
    log.debug('Player', this.id, 'set registered:', registered);

    this.isRegistered = registered;

    this.save();
  }
}

module.exports = Player;

