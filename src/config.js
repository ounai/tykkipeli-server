'use strict';

require('dotenv').config();

const config = {};

config.logging = {
  disablePing: true, // No logging of ping related stuff
  printConnectionErrorStackTrace: true
};

config.server = {
  ip: process.env.ACANNONS_IP ?? 'localhost', // default is localhost, ip should be preferred
  port: (process.env.ACANNONS_PORT ? Number(process.env.ACANNONS_PORT) : 4242), // default 4242
  maxPlayers: 1000, // comment out for unlimited
  pingIntervalSeconds: 10, // Keep below 60s so clients won't disconnect
  motd: '', // Displayed to players joining the lobby

  // Paths where packet handler js files are loaded
  inPacketPaths: [
    'packets/in',
    'packets/in/lobby',
    'packets/in/game'
  ]
};

config.fileServer = {
  port: (config.server.port + 1), // default 4243
  servePath: 'public'
};

config.database = {
  enableLogging: false, // Should executed SQL queries be logged
  dialect: 'sqlite', // MySQL and Postgres *should* be supported out of the box
  storage: ':memory:' // Store SQLite DB in memory

  // To persist database on disk:
  // storage: './data/db.sqlite'
};

module.exports = config;
