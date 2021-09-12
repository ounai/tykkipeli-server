'use strcit';

const chalk = require('chalk');

const OutPacket = require('./packets/out/OutPacket');
const Player = require('../db/models/Player');
const GamePlayer = require('../db/models/GamePlayer');

const log = require('../Logger')('Broadcast');

class Broadcast {
  #players;
  #packet;
  #server;

  constructor(players, packet, server) {
    if (!(packet instanceof OutPacket)) throw new Error(`Invalid packet ${packet}`);
    if (!server) throw new Error(`Invalid server ${server}`);

    this.#players = players;
    this.#packet = packet;
    this.#server = server;
  }

  async #writeToPlayer(player) {
    if (!(player instanceof Player)) throw new Error(`Invalid player ${player}`);

    await player.reload();

    if (player.isConnected) {
      log.debug('Sending', this.#packet.constructor.name, 'to', chalk.magenta(player.toString()));

      try {
        const playerConnection = this.#server.connectionHandler.getPlayerConnection(player);

        this.#packet.write(playerConnection);
      } catch (err) {
        log.error(`Could not write broadcast to player ${chalk.magenta(player.toString())}:\n`, err);
      }
    } else {
      log.debug('Not sending', this.#packet.constructor.name, 'to', chalk.magenta(player.toString()), '(player not connected)');
    }
  }

  async writeAll() {
    if (this.#players.length === 0) {
      log.debug(`Not broadcasting ${this.#packet.constructor.name}, empty audience`);
    } else {
      log.debug('Broadcasting', this.#packet.constructor.name, 'to', this.#players.length, 'players');

      for (const player of this.#players) {
        if (player instanceof Player) {
          await this.#writeToPlayer(player);
        } else if (player instanceof GamePlayer) {
          await this.#writeToPlayer(await player.getPlayer());
        }
      }

      log.debug('Broadcast complete');
    }
  }
}

module.exports = Broadcast;

