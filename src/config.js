'use strict';

require('dotenv').config();

const config = {};

const inPacketPaths = [
  'packets/in',
  'packets/in/lobby',
  'packets/in/game'
];

config.logging = {
  disablePing: true // No logging of ping related stuff
};

config.server = {
  ip: process.env.ACANNONS_IP || 'localhost',
  port: (process.env.ACANNONS_PORT ? Number(process.env.ACANNONS_PORT) : 4242),
  maxPlayers: 1000, // comment out for unlimited
  pingIntervalSeconds: 10,
  motd: '',
  inPacketPaths
};

config.fileServer = {
  port: (config.server.port + 1), // default 4243
  servePath: 'public'
};

config.database = {
  enableLogging: false,
  dialect: 'sqlite',
  storage: ':memory:'
  // storage: './data/db.sqlite'
};

module.exports = config;
