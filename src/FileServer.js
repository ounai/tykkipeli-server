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

  init (config) {
    this.#servePath = config.fileServer.servePath;
    this.#port = config.fileServer.port;

    this.#validateConfiguration();

    // Setup express middleware for static files
    this.#app.use(express.static(path.join(__dirname, '..', this.#servePath)));

    return this;
  }

  #onListen () {
    log.info('Serving files from', this.#servePath, 'on port', this.#port);
  }

  listen () {
    log.info('Starting file server...');

    this.#app.listen(this.#port, this.#onListen.bind(this));

    return this;
  }
}

module.exports = FileServer;
