'use strcit';

const chalk = require('chalk');

const OutPacket = require('./packets/out/OutPacket');
const Server = require('../Server');
const Player = require('../db/models/Player');

const log = require('../Logger')('Broadcast');

class Broadcast {
  #players;
  #packet;
  #server;

  constructor(players, packet, server) {
    if (!(packet instanceof OutPacket)) throw new Error(`Invalid packet ${packet}`);
    if (!(server instanceof Server)) throw new Error(`Invalid server ${server}`);

    this.#players = players;
    this.#packet = packet;
    this.#server = server;
  }

  writeAll() {
    if (this.#players.length === 0) {
      log.debug(`Not broadcasting ${this.#packet.constructor.name}, empty audience`);
    } else {
      log.debug('Broadcasting', this.#packet.constructor.name, 'to', this.#players.length, 'players');

      for (const player of this.#players) {
        if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);

        if (player.isConnected) {
          log.debug('Sending', this.#packet.constructor.name, 'to', chalk.magenta(player.toString()));

          this.#packet.write(this.#server.connectionHandler.getPlayerConnection(player));
        } else {
          log.debug('Not sending', this.#packet.constructor.name, 'to', chalk.magenta(player.toString()), '(player not connected)');
        }
      }

      log.debug('Broadcast complete');
    }
  }
}

module.exports = Broadcast;

