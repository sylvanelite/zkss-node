var Ch = {};

Ch.createPlayer = function (scene){
    var ch =  {};
    ch.controlSource=CONSTS.CONTROL_SOURCE.NONE;
    ch.id = Ch.generateGUID();
    
    var sphere = BABYLON.Mesh.CreateSphere(ch.id, 16/*segments*/, 20/*diameter*/, scene);
    ch.mesh = sphere;
    
    ch.camera = new BABYLON.FreeCamera("ch_camera_"+ch.id, new BABYLON.Vector3(10, ch.mesh.position.y, -10), scene);
    ch.camera.checkCollisions = false;
    ch.camera.setTarget(BABYLON.Vector3.Zero());
    
    ch.render = function () {};
    ch.keyDown = function () {};
    ch.keyUp = function () {};
    ch.click = function () {};
    
    return ch;
};

Ch.generateGUID = function(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

