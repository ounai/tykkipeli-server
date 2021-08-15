'use strict';

const { Sequelize } = require('sequelize');

const log = require('../Logger')('Database');
const { getFilenamesInDirectory } = require('../utils');

class Database {
  #sequelize;
  #models;

  async #writeRows(model, rows = []) {
    for (const row of rows) {
      await model.create(row);
    }
  }

  async #initModels(modelsPath) {
    this.#models = {};

    // Init models
    for (const filename of getFilenamesInDirectory(modelsPath, 'js')) {
      log.debug('Loading model file', filename);

      const model = require(`./models/${filename}`);
      const modelName = model.name;

      log.debug('Init model', modelName);

      model.init(model.columns, {
        sequelize: this.#sequelize,
        timestamps: model.timestamps ?? false
      });

      this.#models[modelName] = model;
    }
  }

  async #initAssociations() {
    for (const [modelName, model] of Object.entries(this.#models)) {
      for (const [association, target, opts = {}] of (model.associated ?? [])) {
        log.debug('Creating association:', modelName, association, target);

        model[association](this.#models[target], opts);
      }

      await model.sync();
    }
  }

  async #setupModels() {
    // Predefined rows
    for (const [modelName, model] of Object.entries(this.#models)) {
      if (model.rows) {
        log.debug('Clearing table', modelName);

        await model.destroy({ truncate: true });
        await this.#writeRows(model, model.rows);
      }
    }
  }

  constructor(databaseConfig) {
    log.info('Initializing database connection...');

    this.#sequelize = new Sequelize({
      ...databaseConfig,
      logging: (databaseConfig.enableLogging ? msg => log.debug(msg) : false)
    });
  }

  async init() {
    log.info('Connecting to the database...');

    await this.#initModels('./src/db/models');
    await this.#initAssociations();
    await this.#setupModels();

    log.info('Database connection successful!');

    const modelNames = Object.keys(this.#models);

    log.debug('Successfully loaded', modelNames.length, 'models:', modelNames.join(', '));
  }
}

module.exports = Database;

