const Renderer = require('lance-gg').render.Renderer;

class SLRenderer extends Renderer {

    // constructor
    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.scene = null;
		this.renderCache = [];
		this.isReady = true;
    }
    // setup the 3D scene
    init() {
        return super.init().then(() =>{
            BY.init();
			this.scene = BY.scene;
        });
    }

    draw() {
        super.draw();
        LANCE.gameEngine.world.forEachObject((id, obj) => {
			var cacheName = obj.class.name+obj.id;
			if(!this.renderCache.hasOwnProperty(cacheName)){
				var isOwnedByPlayer =this.clientEngine.isOwnedByPlayer(obj);
				this.renderCache[cacheName]= obj.getSprite(BY,Ch,CONSTS,BABYLON,isOwnedByPlayer);
			}
			var rObj = this.renderCache[cacheName];
			obj.render(rObj);
        });
    }
}

module.exports = SLRenderer;
