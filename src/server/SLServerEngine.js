'use strict';

const ServerEngine = require('lance-gg').ServerEngine;

class SLServerEngine extends ServerEngine {
    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.serializer.registerClass(require('../common/Car'));
        this.serializer.registerClass(require('../common/Arena'));
        this.serializer.registerClass(require('../common/OBJ_BULLET'));
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
		this.gameEngine.createObj("Car",socket.playerId);
        socket.on('keepAlive', ()=>{
            this.resetIdleTimeout(socket);
        });
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);
        this.gameEngine.removeObj(playerId);
    }

    gameStatus(statusQuery) {
        let statusString = super.gameStatus();
        if (statusQuery && statusQuery.debug) {
            let lanceStatus = JSON.parse(statusString);
            lanceStatus.log = this.gameEngine.log;
            statusString = JSON.stringify(lanceStatus);
        }
        return statusString;
    }
}

module.exports = SLServerEngine;
