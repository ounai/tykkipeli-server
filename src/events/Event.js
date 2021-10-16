'use strict';

const log = require('../Logger')('Event');

class Event {
  #args;

  constructor (...args) {
    this.#args = args;
  }

  fire () {
    log.debug('Firing event:', this.constructor.name);

    this.handle(...this.#args);
  }

  handle () {}
}

module.exports = Event;
