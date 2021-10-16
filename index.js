'use strict';

const Server = require('./src/Server');

const config = require('./config');
const log = require('./src/Logger')('index');

const init = async () => {
  const server = new Server();

  await server.init(config);

  server.listen();
};

log.info('Initializing...');

init();
