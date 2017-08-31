Ch.fps = {};

Ch.fps.createPlayer = function (scene){
    var ch = Ch.createPlayer(scene);
    
    ch.FPS_camera = new BABYLON.FreeCamera("FPS_camera_"+ch.id, new BABYLON.Vector3(10, ch.mesh.position.y, -10), scene);
    ch.FPS_camera.setTarget(BABYLON.Vector3.Zero());
    //todo: http://www.babylon.actifgames.com/moveCharacter/Scene.js
    //      make proper orbit camera?
    ch.ORBIT_camera = new BABYLON.FreeCamera("ORBIT_camera_"+ch.id, new BABYLON.Vector3(10, ch.mesh.position.y, -10), scene);
    ch.ORBIT_camera.checkCollisions = false;
    ch.ORBIT_camera.setTarget(ch.mesh.position);
    
    //https://doc.babylonjs.com/tutorials/customizing_camera_inputs
    //ch.FPS_camera.inputs.remove(ch.FPS_camera.inputs.attached.keyboard);
    //ch.FPS_camera.inputs.remove(ch.ORBIT_camera.inputs.attached.mouse);
    ch.FPS_camera.inputs.clear();
    ch.ORBIT_camera.inputs.clear();
    
    ch.camera_mode = CONSTS.CAMERA.FPS;
    ch.camera = ch.FPS_camera;
    
    ch.render = Ch.fps.render;
    ch.keyUp = Ch.fps.keyUp;
    ch.click = Ch.fps.click;
    
    return ch;
};

Ch.fps.render = function (self) {
    var height = 15;
    var distance = 25;
    var above = 10;
    if(self.camera_mode == CONSTS.CAMERA.ORBIT){
        self.ORBIT_camera.position.x= self.mesh.position.x;
        self.ORBIT_camera.position.z= self.mesh.position.z;
        var orbit = new BABYLON.Vector3(parseFloat(Math.sin(parseFloat(self.camera.rotation.y))) ,
                                        1,
                                        parseFloat(Math.cos(parseFloat(self.camera.rotation.y))) );
        orbit = orbit.negate();
        self.ORBIT_camera.position.x += orbit.x * distance;
        self.ORBIT_camera.position.z += orbit.z * distance;
        self.ORBIT_camera.position.y = self.mesh.position.y+height;
        
        var orbitTarget = new BABYLON.Vector3(self.mesh.position.x, self.mesh.position.y+above, self.mesh.position.z);
        self.ORBIT_camera.setTarget(orbitTarget);
    }else{
        self.FPS_camera.position.x = self.mesh.position.x;
        self.FPS_camera.position.y = self.mesh.position.y;
        self.FPS_camera.position.z = self.mesh.position.z;
        self.mesh.rotation.y = self.FPS_camera.rotation.y;
    }
};

Ch.fps.keyUp = function(self, key){
    switch(key){
        case CONSTS.KEYS.TAB:
            if(self.camera_mode == CONSTS.CAMERA.ORBIT){
                self.camera_mode = CONSTS.CAMERA.FPS;
                self.mesh.isVisible = false;
                self.camera = self.FPS_camera;
                
                self.FPS_camera.position.x = self.mesh.position.x;
                self.FPS_camera.position.y = self.mesh.position.y;
                self.FPS_camera.position.z = self.mesh.position.z;
                self.FPS_camera.rotation.y = self.mesh.rotation.y;
            }else{
                self.camera_mode = CONSTS.CAMERA.ORBIT;
                self.mesh.isVisible = true;
                self.camera = self.ORBIT_camera;
            }
            break;
    }
};

Ch.fps.click = function(self, mX,mY){
    //use jQuery width because devicePixelRatio!=1 can throw off picking when using renderWidth.
    //var width = BY.scene.getEngine().getRenderWidth();
    //var height = BY.scene.getEngine().getRenderHeight();
    var width = $(BY.canvas).width();
    var height = $(BY.canvas).height();
    mX=width/2;
    mY=height/2;
    var pickInfo = BY.scene.pick(mX, mY, null, false, BY.scene.activeCamera);
    if (pickInfo.hit) {
        if(self.camera_mode == CONSTS.CAMERA.ORBIT){
            
            var rx = self.ORBIT_camera.position.x - Math.cos(self.mesh.rotation.y) * 1000;
            var rz = self.ORBIT_camera.position.z +-Math.sin(self.mesh.rotation.y) * 1000;
            
            var ray = new BABYLON.Ray(self.mesh.position,new BABYLON.Vector3(rx,self.mesh.position.y,rz));
            pickInfo = BY.scene.pickWithRay(ray,null);
        }
        if (pickInfo.pickedMesh.name === BY.ground.name) {
            var sphere = BABYLON.Mesh.CreateSphere('sphereaaa', 1, 1, BY.scene);
            sphere.position = pickInfo.pickedPoint;
        } else {
            for (var i = 0; i < BY.varPlayers.length; i += 1) {
                var ch = BY.varPlayers[i];
                if (ch.id!=self.id && pickInfo.pickedMesh.name === ch.id) {
                    ch.mesh.position.x += 5;// = Math.random() * 30 - Math.random() * 30;
                }
            }
        }
    }
};









