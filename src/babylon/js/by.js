var BY = {};

BY.init = function() {
    BY.viewX = 645;
    BY.viewY = 604;
    console.log("Start Loading...");
    BY.canvas= null;
    BY.light= null;
    BY.scene= null;
    BY.skybox= null;
    BY.varPlayers= [];
    BY.varRenderCache = [];

    var initScene = function() {
        BY.canvas = $("#renderCanvas")[0];
        BY.engine = new BABYLON.Engine(BY.canvas, true);
        BY.engine.enableOfflineSupport= false;//surpress get requests for manifest files
        BY.scene = new BABYLON.Scene(BY.engine);
        BY.light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), BY.scene);
        BY.light.specular = new BABYLON.Color3(0, 0, 0);
    };
    var initPointerLock = function() {
        $("#renderCanvas").on("click", function() {
                BY.canvas.requestPointerLock = BY.canvas.requestPointerLock ||
                    BY.canvas.msRequestPointerLock ||
                    BY.canvas.mozRequestPointerLock ||
                    BY.canvas.webkitRequestPointerLock;
                if (BY.canvas.requestPointerLock) {
                    BY.canvas.requestPointerLock();
                }
            });
        var pointerlockchange = function() {};
        $(document).on("pointerlockchange", pointerlockchange);
        $(document).on("mspointerlockchange", pointerlockchange);
        $(document).on("mozpointerlockchange", pointerlockchange);
        $(document).on("webkitpointerlockchange", pointerlockchange);
    };
    
    initScene();
    initPointerLock();
    $("#renderCanvas").on("click", BY.click);
    $(document).on("keydown",BY.keyDown);
    $(document).on("keyup",BY.keyUp);
    BY.engine.runRenderLoop(BY.renderLoop);
    $(window).on("resize", function() {
        BY.engine.resize();
    });
    
    BY.scene.activeCamera = new BABYLON.FreeCamera("initial_camera", new BABYLON.Vector3(10, -10, 10), BY.scene);
    console.log("...Loading Done");
};

BY.click = function(e) {
    for(var i=0;i<BY.varPlayers.length;i+=1){
        if(BY.varPlayers[i].controlSource == CONSTS.CONTROL_SOURCE.KEYBOARD){
            //BY.varPlayers[i].click(BY.varPlayers[i],e.pageX,e.pageY);
        }
    }
};

BY.keyDown = function(e) {
    for(var i=0;i<BY.varPlayers.length;i+=1){
        if(BY.varPlayers[i].controlSource == CONSTS.CONTROL_SOURCE.KEYBOARD){
            BY.varPlayers[i].keyDown(BY.varPlayers[i],e.which);
        }
    }
    e.preventDefault();
};

BY.keyUp = function (e){
    for(var i=0;i<BY.varPlayers.length;i+=1){
        if(BY.varPlayers[i].controlSource == CONSTS.CONTROL_SOURCE.KEYBOARD){
            BY.varPlayers[i].keyUp(BY.varPlayers[i],e.which);
        }
    }
    e.preventDefault();
};

BY.renderLoop = function() {
    for(var i=0;i<BY.varPlayers.length;i+=1){
        if(BY.varPlayers[i].controlSource == CONSTS.CONTROL_SOURCE.KEYBOARD){
            BY.scene.activeCamera = BY.varPlayers[i].camera;
            BY.varPlayers[i].render(BY.varPlayers[i]);
        }
    }
    BY.scene.render();
};
