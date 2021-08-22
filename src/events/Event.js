'use strict';

const log = require('../Logger')('Event');

class Event {
  constructor(...args) {
    log.debug('Handling event:', this.constructor.name);

    this.handle(...args);
  }

  handle() {}
}

module.exports = Event;

