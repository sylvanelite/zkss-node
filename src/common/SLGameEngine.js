'use strict';

const GameEngine = require('lance-gg').GameEngine;
const ThreeVector = require('lance-gg').serialize.ThreeVector;
const Car = require('./Car');
const Arena = require('./Arena');
const OBJ_BULLET = require('./OBJ_BULLET');

// todo check if this should be global
let CANNON = null;

class SLGameEngine extends GameEngine {

    constructor(options) {
        super(options);
        this.log = [];
        CANNON = this.physicsEngine.CANNON;
        this.on('server__init', this.gameInit.bind(this));
    }

    gameInit() {
        this.arena = new Arena(++this.world.idCount, this);
        this.arena.position.y = -15.4;
        this.addObjectToWorld(this.arena);
    }

    step(isReenact) {
        super.step(isReenact);
        // car physics
        this.world.forEachObject((id, o) => {
            if (o.class !== Arena) {
				o.step();
            }
        });
    }

	createObj(objName,playerID){
		switch(objName){
			case "Car":
				let existingCar = this.world.getPlayerObject(playerID);
				if (existingCar) {
					return existingCar;
				}
				// create a car for this client
				let x = Math.random() * 20 - 10;
				let z = Math.random() * 20 - 10;
				let position = new ThreeVector(x, 10, z);
				let car = new Car(++this.world.idCount, this, position);
				car.playerId = playerID;
				this.addObjectToWorld(car);
				return car;
			case "Arena":
				break;
			case "OBJ_BULLET":
				let bullet = new OBJ_BULLET(++this.world.idCount, this);
				bullet.playerId = playerID;
				this.addObjectToWorld(bullet);
				return bullet;
			default:
				break;
		}
	}
	removeObj(objId){
        let o = this.world.getPlayerObject(objId);
        if (o) {
            this.removeObjectFromWorld(o.id);
		}
	}

    processInput(inputData, playerId) {
        super.processInput(inputData, playerId);
        let playerCar = this.world.getPlayerObject(playerId);
        if (playerCar) {
			if(inputData.input=="up"||inputData.input=="left"||
			   inputData.input=="down"||inputData.input=="right"){
				playerCar.applyKey(inputData.input);
			}
			if(inputData.input === "spacebar"){
				playerCar.applySpace();
			}
			if(inputData.input === "mouse"){
				playerCar.applyMouse(inputData.options.coords);
			}
            playerCar.refreshFromPhysics();
        }
    }
	
}

module.exports = SLGameEngine;
