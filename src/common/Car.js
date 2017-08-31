'use strict';

const PhysicalObject = require('lance-gg').serialize.PhysicalObject;
const OBJ_BULLET = require('./OBJ_BULLET');
const MASS = 2;

let CANNON = null;

class Car extends PhysicalObject {

    constructor(id, gameEngine, position) {
        super(id, position);
		this.Name = "Car";
		this.cam = {
			location:{
				position:{x:0,y:0,z:0},
				rotation:{x:0,y:0,z:0}
			},
			quat:{x:0,y:0,z:0,w:0}
		};
		this.phys = {
			velocityFactor:2,
			jumpVelocity:10,
			canJump:false,
			velocity:0,
			contactNormal:null,
			upAxis:null,
		};
        this.class = Car;
        this.gameEngine = gameEngine;
    }

    onAddToWorld(gameEngine) {

        // create the physics body
        this.gameEngine = gameEngine;
        CANNON = this.gameEngine.physicsEngine.CANNON;
        this.physicsObj = gameEngine.physicsEngine.addBox(1, 1, 2.9, MASS, 0.01);
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);
        this.physicsObj.angularDamping = 0.1;
		
		this.cam.location.position.x=this.position.x;
		this.cam.location.position.y=this.position.y;
		this.cam.location.position.z=this.position.z;
		
		this.phys.contactNormal=new CANNON.Vec3();
		this.phys.upAxis=new CANNON.Vec3(0,1,0);
		var phys = this.phys;
		var physObj = this.physicsObj;
		this.physicsObj.addEventListener("collide",function(e){
			var contact = e.contact;
			if(contact.bi.id == physObj.id){ 
				contact.ni.negate(phys.contactNormal);
			}else{
				phys.contactNormal.copy(contact.ni);
			}
			// If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
			if(phys.contactNormal.dot(phys.upAxis) > 0.5){ // Use a "good" threshold value between 0 and 1 here!
				phys.canJump = true;
			}
		});
		this.phys.velocity = this.physicsObj.velocity;
    }

    step() {
		//friction on x/z
		this.physicsObj.velocity.x=0;
		this.physicsObj.velocity.z=0;
        this.refreshFromPhysics();
    }

	getSprite(BY,Ch,CONSTS,BABYLON,isOwnedByPlayer){
		var player = Ch.fps.createPlayer(BY.scene);
		if(isOwnedByPlayer){
			player.controlSource = CONSTS.CONTROL_SOURCE.KEYBOARD;
		}
		BY.varPlayers.push(player);
		return player;
	}
	render(rObj) {
		if(rObj.mesh){
			rObj.mesh.position.x=this.position.x;
			rObj.mesh.position.y=this.position.y;
			rObj.mesh.position.z=this.position.z;
			//Note: since cam.location.rotation is always being updated
			//FPS view will snap to location.rotation.x when leaving orbit
			rObj.camera.rotation.x = this.cam.location.rotation.x;
			rObj.camera.rotation.y = this.cam.location.rotation.y;
		}
	}
	
    toString() {
        return `Car::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeObject(this.physicsObj);
    }

	
    applyKey(direction) {
		var obj=this;
		//https://github.com/schteppe/cannon.js/blob/master/examples/js/PointerLockControls.js
		//MIT
		var inputVelocity = {
			x:0,y:0,z:0
		};
		if(direction==="up"){
            inputVelocity.z = obj.phys.velocityFactor;
		}
		if(direction==="down"){
            inputVelocity.z = -obj.phys.velocityFactor;
        }
		if(direction==="left"){
            inputVelocity.x = -obj.phys.velocityFactor;
        }
		if(direction==="right"){
            inputVelocity.x = obj.phys.velocityFactor;
        }
		var euler = {x:0,y:0,z:0};
        euler.x = this.cam.location.rotation.x;
        euler.y = this.cam.location.rotation.y;
		this.setFromEuler(euler,this.cam.quat);
		this.applyQuaternion(this.cam.quat,inputVelocity);
		
		this.physicsObj.velocity.x+=inputVelocity.x*10;
		this.physicsObj.velocity.z+=inputVelocity.z*10;
		
    }
	setFromEuler(a, obj) {
		var c = Math.cos(a.x / 2),
		   d = Math.cos(a.y / 2),
		   e = Math.cos(a.z / 2),
		   f = Math.sin(a.x / 2),
		   g = Math.sin(a.y / 2),
		   h = Math.sin(a.z / 2);
		obj.x = f * d * e + c * g * h;
		obj.y = c * g * e - f * d * h;
		obj.z = c * d * h + f * g * e;
		obj.w = c * d * e - f * g * h;
		return obj;
	}
	applyQuaternion(a,obj) {
		var b = obj.x, c = obj.y, d = obj.z, e = a.x, f = a.y, g = a.z;
		a = a.w;
		var h = a * b + f * d - g * c;
		var k = a * c + g * b - e * d;
		var l = a * d + e * c - f * b;
		b = -e * b - f * c - g * d;
		obj.x = h * a + b * -e + k * -g - l * -f;
		obj.y = k * a + b * -f + l * -e - h * -g;
		obj.z = l * a + b * -g + h * -f - k * -e;
		return obj;
	}
	applySpace(){
		if ( this.phys.canJump === true ){
			this.physicsObj.velocity.y = this.phys.jumpVelocity;
			this.phys.canJump = false;
		}
		
		var bullet = this.gameEngine.createObj("OBJ_BULLET",this.playerId);
		var euler = {x:0,y:0,z:0};
        euler.x = this.cam.location.rotation.x;
        euler.y = this.cam.location.rotation.y;
		var inputVelocity = {x:0,y:0,z:1};
		var quat = {x:this.cam.quat.x,y:this.cam.quat.y,z:this.cam.quat.z,w:this.cam.quat.w};
		this.setFromEuler(euler,quat);
		this.applyQuaternion(quat,inputVelocity);
        bullet.physicsObj.position.set(this.position.x, 0, this.position.z);
		bullet.physicsObj.velocity.set(inputVelocity.x*10,0,inputVelocity.z*10);
        bullet.refreshFromPhysics();
	}
	applyMouse(coords){
		var PI_2 = Math.PI / 2;
        this.cam.location.rotation.y += coords.x/100;
        this.cam.location.rotation.x += coords.y/100;
        this.cam.location.rotation.x = Math.max( - PI_2, Math.min( PI_2, this.cam.location.rotation.x ) );
	}
	
}

module.exports = Car;
