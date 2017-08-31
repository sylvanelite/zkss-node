'use strict';

const PhysicalObject = require('lance-gg').serialize.PhysicalObject;
const MASS = 1;

let CANNON = null;

class OBJ_BULLET extends PhysicalObject {

    constructor(id, gameEngine, position) {
        super(id, position);
        this.class = OBJ_BULLET;
        this.gameEngine = gameEngine;
    }

    onAddToWorld(gameEngine) {
        // create the physics body
        this.gameEngine = gameEngine;
        CANNON = this.gameEngine.physicsEngine.CANNON;
        this.physicsObj = gameEngine.physicsEngine.addBox(1, 1, 2.9, MASS, 0.01);
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);
		this.physicsObj.collisionResponse = 0;//note:change this if wanting bouncing/etc?
		var obj = this;
		this.physicsObj.addEventListener("collide",function(e){
			var contact = e.contact;
			if(contact.bi.id == obj.physicsObj.id){ 
				obj.gameEngine.removeObj(obj.id);
			}
		});
    }

    step() {
		this.physicsObj.velocity.y=0;
        this.refreshFromPhysics();
    }
	
    toString() {
        return `OBJ_BULLET::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeObject(this.physicsObj);
    }

	getSprite(BY,Ch,CONSTS,BABYLON,isOwnedByPlayer){
		var sprite = BABYLON.MeshBuilder.CreateBox("bullet", {
				height: 1,
				width: 1,
				depth: 1
			}, BY.scene);
		return sprite;
	}
	render(rObj) {
		rObj.position.x = this.position.x;
		rObj.position.y = this.position.y;
		rObj.position.z = this.position.z;
	}
    
}

module.exports = OBJ_BULLET;
