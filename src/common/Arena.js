'use strict';

const PhysicalObject = require('lance-gg').serialize.PhysicalObject;
const MASS = 0;
const ARENA_SCALE = 0.2;

// width, depth, and height specified in half-segements
const ARENA_BASELINE = 10;
const ARENA_DEPTH = 390 * ARENA_SCALE;
const ARENA_WIDTH = 700 * ARENA_SCALE;
const ARENA_HEIGHT = 250 * ARENA_SCALE;
const ARENA_MODEL_SCALE = 125 * ARENA_SCALE;
const WALL_WIDTH = 5;

const GOAL_DEPTH = 18;
const GOAL_WIDTH = 20;
const GOALSIDE_WIDTH = (ARENA_DEPTH - GOAL_WIDTH) / 2;
const CORNER_RADIUS = 80 * ARENA_SCALE;

// The Arena
//
// Orientation: The 3D world is represented with a right-handed coordinate system.
// The X and Z axis are the floor of the arena, and the Y axis is the height.
// Using the X axis as the North, the Arena is laid out so that it is wide is along
// the X axis, and the goals are at the North end and the South end.
class Arena extends PhysicalObject {

    constructor(id, gameEngine, position) {
        super(id, position);
        this.class = Arena;
        this.gameEngine = gameEngine;
        this.walls = [];
		this.renderBoxes = [];
    }

    // add a wall
    // (x, y, z) are position
    // (dx, dy, dz) are dimensions
    addWall(x, y, z, dx, dy, dz) {
        let wall = this.gameEngine.physicsEngine.addBox(dx, dy, dz, 0, 0.01);
        wall.position.set(x, y, z);
		var box = {
			x:x,
			y:y,
			z:z,
			width:dx*2,height:dy*2,depth:dz*2
			//http://schteppe.github.io/cannon.js/docs/classes/Box.html boxes are 1/2 size
		};
		this.renderBoxes.push(box);
        return wall;
    }

    onAddToWorld(gameEngine) {
        // create the physics body
        this.gameEngine = gameEngine;
        this.physicsObj = gameEngine.physicsEngine.addBox(ARENA_WIDTH * 1.5, ARENA_BASELINE, ARENA_DEPTH * 1.5, MASS, 0 );
        this.physicsObj.position.set(this.position.x, this.position.y, this.position.z);
		console.log(this.position);
        let x = this.position.x;
        let y = this.position.y;
        let z = this.position.z;
		
        // add walls: West, East, and ceiling
		
        this.walls.push(this.addWall(x, y + ARENA_BASELINE + ARENA_HEIGHT, z - ARENA_DEPTH, ARENA_WIDTH, ARENA_HEIGHT, WALL_WIDTH));
        this.walls.push(this.addWall(x, y + ARENA_BASELINE + ARENA_HEIGHT, z + ARENA_DEPTH, ARENA_WIDTH, ARENA_HEIGHT, WALL_WIDTH));
        this.walls.push(this.addWall(x, y + ARENA_BASELINE + ARENA_HEIGHT * 2, z, ARENA_WIDTH, WALL_WIDTH, ARENA_DEPTH));

        // add walls for South goal: backplate, left plate, right plate
        this.walls.push(this.addWall(x - ARENA_WIDTH - GOAL_DEPTH, y + ARENA_BASELINE +ARENA_HEIGHT, z, WALL_WIDTH, ARENA_HEIGHT, GOAL_WIDTH ));
        this.walls.push(this.addWall(x - ARENA_WIDTH - 11, y + ARENA_BASELINE + ARENA_HEIGHT, z - GOALSIDE_WIDTH - GOAL_WIDTH, WALL_WIDTH * 2, ARENA_HEIGHT, GOALSIDE_WIDTH ));
        this.walls.push(this.addWall(x - ARENA_WIDTH - 11, y + ARENA_BASELINE + ARENA_HEIGHT, z + GOALSIDE_WIDTH + GOAL_WIDTH, WALL_WIDTH * 2, ARENA_HEIGHT, GOALSIDE_WIDTH ));

        // add walls for North goal: backplate, left plate, right plate
        this.walls.push(this.addWall(x + ARENA_WIDTH + GOAL_DEPTH, y + ARENA_BASELINE +ARENA_HEIGHT, z, WALL_WIDTH, ARENA_HEIGHT, GOAL_WIDTH ));
        this.walls.push(this.addWall(x + ARENA_WIDTH + 11, y + ARENA_BASELINE + ARENA_HEIGHT, z - GOALSIDE_WIDTH - GOAL_WIDTH, WALL_WIDTH * 2, ARENA_HEIGHT, GOALSIDE_WIDTH ));
        this.walls.push(this.addWall(x + ARENA_WIDTH + 11, y + ARENA_BASELINE + ARENA_HEIGHT, z + GOALSIDE_WIDTH + GOAL_WIDTH, WALL_WIDTH * 2, ARENA_HEIGHT, GOALSIDE_WIDTH ));
   
    }

	getSprite(BY,Ch,CONSTS,BABYLON,isOwnedByPlayer){
		var sprite = [];
		for(var j=0;j<this.renderBoxes.length;j+=1){
			var wall = this.renderBoxes[j];
			var box = BABYLON.MeshBuilder.CreateBox("arena_"+j, {
				height: wall.height,
				width: wall.width,
				depth: wall.depth
			}, BY.scene);
			box.position.x = wall.x;
			box.position.y = wall.y;
			box.position.z = wall.z;
			sprite.push(box);
		}
		return sprite;
	}
	render(rObj) {
		
	}
    toString() {
        return `Arena::${super.toString()}`;
    }

    destroy() {
        this.gameEngine.physicsEngine.removeBody(this.physicsObj);
    }

}

module.exports = Arena;
