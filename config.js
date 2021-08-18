'use strict';

require('dotenv').config();

const config = {};

config.server = {
  ip: process.env.ACANNONS_IP || 'localhost',
  port: process.env.ACANNONS_PORT || 4242,
  maxPlayers: 1000, // comment out for unlimited
  pingIntervalSeconds: 10,
  motd: ''
};

config.database = {
  enableLogging: false,
  dialect: 'sqlite',
  storage: ':memory:'
  //storage: './data/db.sqlite'
};

module.exports = config;

