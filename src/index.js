'use strict';

const FileServer = require('./FileServer');
const GameServer = require('./GameServer');

const config = require('./config');
const log = require('./Logger')('index');

const init = async () => {
  log.info('Initializing...');

  // Serve static game files
  new FileServer().init(config).listen();

  // Run game server
  (await new GameServer().init(config)).listen();
};

init();
