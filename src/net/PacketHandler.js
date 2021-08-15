'use strict';

const Player = require('../db/models/Player');

const log = require('../Logger')('PacketHandler');
const { getFilenamesInDirectory } = require('../utils');

class PacketHandler {
  #packetHandlers;

  async #handlePacketWithHandler(connection, packet, packetHandler) {
    if (typeof(packetHandler.usesPlayer) !== 'boolean' || !packetHandler.usesPlayer) {
      // Does not use player

      await packetHandler.handle(connection, packet);
    } else {
      // Uses player

      if (typeof(connection.playerId) !== 'number') {
        throw new Error(`Invalid player id ${connection.playerId}`);
      }

      const player = await Player.findById(connection.playerId);

      log.debug('Fetched player for packet handler', packetHandler.constructor.name);

      if (!player) throw new Error(`No player found but ${packetHandler.constructor.name} requires one!`);
      else if (!player.isConnected) throw new Error(`Cannot handle ${packetHandler.constructor.name}, player is not connected!`);
      else await packetHandler.handle(connection, packet, player);
    }
  }

  #registerPacketHandlers(packetHandlersPath) {
    log.info('Registering packet handlers...');

    this.#packetHandlers = [];

    for (const filename of getFilenamesInDirectory(`${packetHandlersPath}`, 'js')) {
      log.debug('Registering packet', filename);

      const PacketHandler = require.main.require(`${packetHandlersPath}/${filename}`);

      this.#packetHandlers.push(new PacketHandler());
    }
  }

  constructor(packetHandlersPath) {
    log.debug('Creating packet handler for path', packetHandlersPath);

    this.#registerPacketHandlers(packetHandlersPath);
  }

  async onPacket(connection, packet) {
    let handled = false;

    for (const packetHandler of this.#packetHandlers) {
      if (packet.type === packetHandler.type && packetHandler.match(packet)) {
        log.debug('Packet matches', packetHandler.constructor.name);

        await this.#handlePacketWithHandler(connection, packet, packetHandler);

        log.info(packetHandler.constructor.name, 'handled!');

        handled = true;
      }
    }

    if (!handled) log.debugError('Packet not handled!', packet);
  }
}

module.exports = PacketHandler;

