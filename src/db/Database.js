'use strict';

const { Sequelize } = require('sequelize');

const log = require('../Logger')('Database');
const { getFilenamesInDirectory } = require('../utils');

class Database {
  #sequelize;

  async #writeRows(model, rows = []) {
    for (const row of rows) {
      await model.create(row);
    }
  }

  async #initModel(model, alter = false) {
    model.init(model.model, {
      sequelize: this.#sequelize,
      timestamps: model.timestamps ?? false
    });

    await model.sync({ alter });

    if (model.rows) {
      await model.destroy({ truncate: true });
      await this.#writeRows(model, model.rows);
    }
  }

  async #initModels(alter) {
    for (const filename of getFilenamesInDirectory('./src/db/models', 'js')) {
      log.debug('Loading model file', filename);

      const model = require(`./models/${filename}`);

      this.#initModel(model, alter);
    }
  }

  constructor(databaseConfig) {
    this.#sequelize = new Sequelize({
      ...databaseConfig,
      logging: msg => log.debug(msg)
    });
  }

  async init(alter) {
    log.info('Connecting to database...');

    await this.#initModels(alter);
  }
}

module.exports = Database;

