const EventEmitter = require('eventemitter3');

// keyboard handling
const keyCodeTable = {
    32: 'spacebar',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'left',
    87: 'up',
    68: 'right',
    83: 'down'
};

class KeyboardControls{
    constructor(){
        Object.assign(this, EventEmitter.prototype);
        this.setupListeners();
        // keep a reference for key press state
        this.activeInput = {
            spacebar: false,
            down: false,
            up: false,
            left: false,
            right: false
        };
        this.mouseCoords = {
            x:0,y:0
        };
    }
    setupListeners(){
        document.addEventListener('keydown', (e) => { this.onKeyChange(e, true);});
        document.addEventListener('keyup', (e) => { this.onKeyChange(e, false);});
        document.addEventListener("mousemove", (e) => {this.onMouseMove(e);});
    }

    onMouseMove(e){
        this.mouseCoords.x=e.movementX;
        this.mouseCoords.y=e.movementY;
    }
    
    onKeyChange(e, isDown) {
        e = e || window.event;
        let keyName = keyCodeTable[e.keyCode];
        if (keyName) {
            this.activeInput[keyName] = isDown;
            this.lastKeyPressed = isDown ? e.keyCode : null;
            e.preventDefault();
        }
    }
}

module.exports = KeyboardControls;