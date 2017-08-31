const ClientEngine = require('lance-gg').ClientEngine;
const KeyboardControls = require('../client/KeyboardControls');
const SLRenderer = require('./SLRenderer');

// The SoccerLeague client-side engine
class SLClientEngine extends ClientEngine {

    // constructor
    constructor(gameEngine, options) {
        super(gameEngine, options, SLRenderer);
        this.serializer.registerClass(require('../common/Car'));
        this.serializer.registerClass(require('../common/Arena'));
        this.serializer.registerClass(require('../common/OBJ_BULLET'));
        this.gameEngine.on('client__preStep', this.preStep, this);
    }
    start() {
        super.start();
        if (this.renderer.isReady) {
            this.onRendererReady();
        } else {
            this.renderer.once('ready', this.onRendererReady, this);
        }
		this.gameEngine.on('objectAdded', obj => {
            if(obj.constructor.name == 'Arena'){
                this.gameEngine.arena = obj;
            }
        });
    }
    // extend ClientEngine connect to add own events
    connect() {
        return super.connect().then(() => {
            this.socket.on('disconnect', e => {
                console.log('disconnected', e);
            });
        });
    }
    onRendererReady() {
        this.connect();
        this.controls = new KeyboardControls(this.renderer);
    }
	
	
    // our pre-step is to process inputs that are "currently pressed" during the game step
    preStep() {
		if(this.controls.mouseCoords.x !== 0 ||
		   this.controls.mouseCoords.y !== 0){
			this.sendInput("mouse",{movement: true, coords:{
				x:this.controls.mouseCoords.x,
				y:this.controls.mouseCoords.y
			}});
			this.controls.mouseCoords.x=0;
			this.controls.mouseCoords.y=0;
        }
        if (this.controls) {
            if (this.controls.activeInput.up) {
                this.sendInput('up', { movement: true });
            }
            if (this.controls.activeInput.left) {
                this.sendInput('left', { movement: true });
            }
            if (this.controls.activeInput.right) {
                this.sendInput('right', { movement: true });
            }
            if (this.controls.activeInput.down) {
                this.sendInput('down', { movement: true });
            }
            if (this.controls.activeInput.spacebar) {
                this.sendInput('spacebar', { movement: true });
            }
        }
    }

}


module.exports = SLClientEngine;
