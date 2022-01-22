'use strict';

const Server = require('./Server');

const config = require('./config');
const log = require('./Logger')('index');

const init = async () => {
  const server = new Server();

  await server.init(config);

  server.listen();
};

log.info('Initializing...');

init();
