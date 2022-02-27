'use strict';

const express = require('express');
const path = require('path');

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

  #onListen () {
    log.info('Serving files from', this.#servePath, 'on port', this.#port);
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

  init (config) {
    this.#servePath = config.fileServer.servePath;
    this.#port = config.fileServer.port;

    this.#validateConfiguration();

    // Setup express middleware for static files
    this.#app.use(express.static(path.join(__dirname, '..', this.#servePath)));

    // Index path
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