'use strict';

const log = require('../Logger')('Event');

class Event {
  #args;

  constructor (...args) {
    this.#args = args;
  }

  async fire () {
    log.debug('Firing event:', this.constructor.name);

    await this.handle(...this.#args);
  }

  async handle () {}
}

module.exports = Event;
