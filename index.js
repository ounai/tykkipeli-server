'use strict';

const Server = require('./src/Server');

const config = require('./config');
const log = require('./src/Logger')('index');

log.info('Initializing...');

new Server(config, server => server.listen());

