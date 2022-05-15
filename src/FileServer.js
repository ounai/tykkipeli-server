'use strict';

const express = require('express');
const path = require('path');
const chalk = require('chalk');

const Utils = require('./Utils');

const log = require('./Logger')('FileServer');

class FileServer {
  #app;
  #servePath;
  #port;

  constructor () {
    this.#app = express();
  }

  #validateConfiguration () {
    if (typeof this.#servePath !== 'string' || this.#servePath.length === 0) {
      throw new Error(`Invalid serve path ${this.#servePath}`);
    }

    Utils.validatePort(this.#port);
  }

  #indexRoute (req, res) {
    res.end([
      'To Whom It May Concern,',
      '',
      '\tHello, World!',
      '',
      'Yours Sincerely,',
      '',
      '\tTykkipeli file server',
      `\tPort ${this.#port}`
    ].join('\n'));
  }

  #onListen () {
    log.info('Serving files from', chalk.magenta(this.#servePath), 'on port', this.#port);
  }

  init (config) {
    this.#servePath = path.join(__dirname, '..', config.fileServer.servePath);
    this.#port = config.fileServer.port;

    this.#validateConfiguration();

    // Setup express middleware for static files
    this.#app.use(express.static(this.#servePath));

    // Index path /
    this.#app.get('/', this.#indexRoute.bind(this));

    return this;
  }

  listen () {
    log.info('Starting file server...');

    this.#app.listen(this.#port, this.#onListen.bind(this));

    return this;
  }
}

module.exports = FileServer;
