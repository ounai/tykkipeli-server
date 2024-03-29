'use strict';

const { Model, DataTypes, Op } = require('sequelize');
const chalk = require('chalk');

const GameState = require('./GameState');

const { getRandomInt } = require('../../Utils');
const log = require('../../Logger')('Player');

const columns = {
  connectionId: {
    type: DataTypes.INTEGER,
    unique: true
  },
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
  },
  hasLoggedIn: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  lastPong: {
    type: DataTypes.DATE,
    allowNull: true
  },
  clanName: DataTypes.STRING(16)
};

const associated = [
  ['belongsTo', 'GameState'],
  ['hasOne', 'GamePlayer']
];

class Player extends Model {
  static get columns () {
    return columns;
  }

  static get associated () {
    return associated;
  }

  static async findById (id) {
    return await this.findByPk(id);
  }

  static async destroyById (id) {
    return await this.destroy({
      where: { id }
    });
  }

  static async countConnected () {
    return await this.count({
      where: {
        isConnected: true
      }
    });
  }

  static async destroyOldDisconnectedPlayers (tresholdDate = null) {
    log.debug('Destroying old disconnected player models...');

    if (tresholdDate === null) {
      // Default to one hour ago
      tresholdDate = new Date();
      tresholdDate.setHours(tresholdDate.getGetHours() - 1);
    }

    await this.destroy({
      where: {
        isConnected: false,
        disconnectedAt: {
          [Op.lt]: tresholdDate
        }
      }
    });
  }

  static async countByGameState (...gameStateNames) {
    return await this.count({
      where: {
        '$GameState.name$': gameStateNames
      },
      include: GameState
    });
  }

  static async findByUsername (username) {
    return await this.findOne({
      where: { username }
    });
  }

  static async isUsernameInUse (username) {
    return !!(await this.findByUsername(username));
  }

  static async findByGameState (...gameStateNames) {
    return await this.findAll({
      where: {
        isConnected: true,
        '$GameState.name$': gameStateNames
      },
      include: GameState
    });
  }

  #getUserInfoFlags () {
    const flags = {
      r: this.isRegistered,
      v: this.isVip,
      s: this.accessLevel >= 1 // sheriff
    };

    return Object.entries(flags)
      .filter(([flag, enabled]) => typeof flag === 'string' && flag.length === 1 && enabled)
      .map(([flag]) => flag)
      .join('');
  }

  getLobbyInfoString (version = 3) {
    if (version === 3) {
      const flags = this.#getUserInfoFlags();

      const userInfo = [
        this.username,
        (flags.length === 0 ? '-' : flags),
        this.ranking,
        this.language,
        '-', // player card
        '-' // player icon
      ];

      return '3:' + userInfo.join('^');
    } else {
      throw new Error(`Unsupported user info string version ${version}`);
    }
  }

  async getGameInfoString (includeId = true) {
    const info = [];

    if (includeId) {
      const gamePlayer = await this.getGamePlayer();

      info.push(gamePlayer.id);
    }

    info.push(this.username);
    info.push(this.clanName ?? '-');
    info.push('-');

    return info.join('\t');
  }

  async countOthersByGameState (...gameStateNames) {
    return await Player.count({
      where: {
        isConnected: true,
        id: { [Op.not]: this.id },
        '$GameState.name$': gameStateNames
      },
      include: GameState
    });
  }

  async findOthersByGameState (...gameStateNames) {
    return await Player.findAll({
      where: {
        isConnected: true,
        id: { [Op.not]: this.id },
        '$GameState.name$': gameStateNames
      },
      include: GameState
    });
  }

  async setConnected (connected) {
    this.isConnected = connected;
    this.disconnectedAt = (connected ? null : new Date());

    if (!this.connected) this.connectionId = null;

    await this.save();
  }

  async setLocale (locale) {
    const language = locale.slice(0, 2);

    this.locale = locale;
    this.language = language;

    await this.save();
  }

  async setRegistered (registered) {
    this.isRegistered = registered;

    await this.save();
  }

  async setUsername (username) {
    this.username = username;

    await this.save();
  }

  async setConnectionId (connectionId) {
    this.connectionId = connectionId;

    await this.save();
  }

  async setHasLoggedIn (hasLoggedIn) {
    this.hasLoggedIn = hasLoggedIn;

    await this.save();
  }

  // TODO: min and max length values customizable in config
  async requestUsername (username) {
    log.debug('Player', this.id, 'requests username', chalk.cyan(username));

    if (username === this.username) {
      log.debug(`Username not set, this player already is ${this.toColorString()}`);
    } else if (username.length < 3) {
      log.debug(`Username not set, "${chalk.cyan(username)}" too short`);
    } else if (username.length > 16) {
      log.debug(`Username not set, "${chalk.cyan(username)}" too long`);
    } else if (await Player.isUsernameInUse(username)) {
      log.debug(`Username not set, "${chalk.cyan(username)}" already in use`);
    } else {
      await this.setUsername(username);

      log.debug(`Username "${chalk.cyan(username)}" set!`);
    }
  }

  async isGameState (gameStateName) {
    return (await this.getGameState()).name === gameStateName;
  }

  async updateLastPong () {
    this.lastPong = new Date();

    await this.save();
  }

  async getGame () {
    const gamePlayer = await this.getGamePlayer();

    return (gamePlayer === null)
      ? null
      : await gamePlayer.getGame();
  }

  toString () {
    return `${this.username} (id=${this.id})`;
  }

  toColorString () {
    return chalk.magenta(this.toString());
  }
}

module.exports = Player;
