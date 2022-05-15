'use strict';

const { Model, DataTypes } = require('sequelize');
const chalk = require('chalk');

const Player = require('./Player');
const GamePlayer = require('./GamePlayer');
const Round = require('./Round');

const columns = {
  name: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  password: DataTypes.STRING(64),
  registeredPlayersOnly: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  roundCount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  thinkingTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  dudsEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  hasStarted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  currentRoundNumber: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 20
    }
  }
};

const associated = [
  ['hasMany', 'GamePlayer'],
  ['hasMany', 'Round'],
  ['belongsTo', 'WeaponAddingMode'],
  ['belongsTo', 'PlayingOrderMode'],
  ['belongsTo', 'WindMode'],
  ['belongsTo', 'ScoringMode']
];

class Game extends Model {
  static get columns () {
    return columns;
  }

  static get associated () {
    return associated;
  }

  static async findById (id) {
    return await this.findByPk(id);
  }

  get isPasswordRequired () {
    return this.password !== null;
  }

  async isReadyToStart () {
    if (this.hasStarted) {
      return false;
    }

    const gamePlayers = await GamePlayer.findAll({
      where: {
        GameId: this.id
      }
    });

    // Game cannot start with less than two players
    if (gamePlayers.length < 2) {
      return false;
    }

    for (const gamePlayer of gamePlayers) {
      if (!gamePlayer.isReadyToStart) {
        return false;
      }
    }

    return true;
  }

  async getPlayerCount () {
    return (await this.getGamePlayers()).length;
  }

  async getPlayers () {
    const gamePlayers = await this.getGamePlayers({
      include: Player
    });

    return gamePlayers.map(gamePlayer => gamePlayer.Player);
  }

  async canBeJoined () {
    return (!this.hasStarted && (await this.getPlayerCount()) < this.maxPlayers);
  }

  async getPlayerNamesString () {
    return (await this.getPlayers()).map(player => player.username).join(', ');
  }

  async getGameListItem () {
    const isPasswordRequired = (this.isPasswordRequired ? 't' : 'f');
    const registeredPlayersOnly = (this.registeredPlayersOnly ? 1 : 0);
    const dudsEnabled = (this.dudsEnabled ? 't' : 'f');
    const canBeJoined = ((await this.canBeJoined()) ? 't' : 'f');
    const playerCount = await this.getPlayerCount();
    const playerNamesString = await this.getPlayerNamesString();
    const weaponAddingModeId = (await this.getWeaponAddingMode()).id;
    const playingOrderModeId = (await this.getPlayingOrderMode()).id;
    const windModeId = (await this.getWindMode()).id;
    const scoringModeId = (await this.getScoringMode()).id;

    return [
      this.id,
      this.name,
      isPasswordRequired,
      registeredPlayersOnly,
      this.maxPlayers,
      this.roundCount,
      weaponAddingModeId,
      playingOrderModeId,
      this.thinkingTime,
      windModeId,
      dudsEnabled,
      scoringModeId,
      '-', // TODO unknown string
      canBeJoined,
      playerCount,
      playerNamesString
    ];
  }

  async getGameListItemString () {
    return (await this.getGameListItem()).join('\t');
  }

  async getGameInfo () {
    const isPasswordRequired = (this.isPasswordRequired ? 't' : 'f');
    const registeredPlayersOnly = (this.registeredPlayersOnly ? 1 : 0);
    const weaponAddingModeId = (await this.getWeaponAddingMode()).id;
    const playingOrderModeId = (await this.getPlayingOrderMode()).id;
    const windModeId = (await this.getWindMode()).id;
    const dudsEnabled = (this.dudsEnabled ? 't' : 'f');
    const scoringModeId = (await this.getScoringMode()).id;

    return [
      this.maxPlayers,
      this.roundCount,
      this.name,
      isPasswordRequired,
      registeredPlayersOnly,
      weaponAddingModeId,
      playingOrderModeId,
      this.thinkingTime,
      windModeId,
      dudsEnabled,
      scoringModeId
    ];
  }

  async findRoundByNumber (roundNumber) {
    return await Round.findOne({
      where: {
        GameId: this.id,
        roundNumber
      }
    });
  }

  async findCurrentRound () {
    return await Round.findOne({
      where: {
        GameId: this.id,
        roundNumber: this.currentRoundNumber
      }
    });
  }

  toString () {
    return `${this.name} (id=${this.id})`;
  }

  toColorString () {
    return chalk.magenta(this.toString());
  }
}

module.exports = Game;
