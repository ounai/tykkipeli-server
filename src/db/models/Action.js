'use strict';

const { Model, DataTypes } = require('sequelize');

const columns = {
  GamePlayerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  TurnId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  actionTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  launchScreenX: DataTypes.INTEGER,
  launchScreenY: DataTypes.INTEGER,
  targetScreenX: DataTypes.INTEGER,
  targetScreenY: DataTypes.INTEGER
};

const associated = [
  ['belongsTo', 'GamePlayer'],
  ['belongsTo', 'Turn']
];

class Action extends Model {
  static get columns () {
    return columns;
  }

  static get associated () {
    return associated;
  }

  getActionString () {
    let actionString = this.actionTypeId.toString();

    const addParam = param => {
      if (param !== null) actionString += `\t${param}`;
    };

    addParam(this.launchScreenX);
    addParam(this.launchScreenY);
    addParam(this.targetScreenX);
    addParam(this.targetScreenY);

    return actionString;
  }
}

module.exports = Action;
