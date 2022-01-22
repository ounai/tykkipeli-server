'use strict';

const FileServer = require('./FileServer');
const GameServer = require('./GameServer');

const config = require('./config');
const log = require('./Logger')('index');

const init = async () => {
  new FileServer().init(config).listen();
  (await (new GameServer().init(config))).listen();
};

log.info('Initializing...');

init();
