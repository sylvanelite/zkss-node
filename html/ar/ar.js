
var AR = {};
AR.toScreenPosition = function(object){
    var camera = AR.scene.camera;
    var width = AR.renderer.domElement.width, height = AR.renderer.domElement.height;
    var widthHalf = width / 2, heightHalf = height / 2;
    var pos = new THREE.Vector3();
    pos = pos.setFromMatrixPosition(object.matrixWorld);
    pos.project(camera);
    
    pos.x = (pos.x * widthHalf) + widthHalf;
    pos.y = - (pos.y * heightHalf) + heightHalf;
    pos.z = 0;
    //messed up because rotation on canv...?
    return pos;
};
AR.beginLoad = function (){
    if (window.ARController && ARController.getUserMediaThreeScene) {
        AR.init();
    }
};
AR.render = function (){
    AR.scene.process();
    if(AR.markerRoot && AR.markerRootK &&
       AR.markerRoot.visible && AR.markerRootK.visible){
        var coord1 = AR.toScreenPosition(AR.markerRoot);
        var coord2 = AR.toScreenPosition(AR.markerRootK);
        console.log(coord1,coord2);
    }
    AR.scene.renderOn(AR.renderer);
    requestAnimationFrame(AR.render);
};
AR.init = function () {
    var getMediaSuccess = function (arScene, arController, arCamera){
        AR.scene = arScene;
        AR.controller = arController;
        AR.camera = arCamera;
        console.log(arScene,arController,arCamera);
        //arController.debugSetup();
        arController.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);
        var renderer = new THREE.WebGLRenderer();
        AR.renderer = renderer;
		var w = AR.scene.video.videoWidth;
		var h = AR.scene.video.videoHeight;
		if (AR.controller.orientation === 'portrait') {
			renderer.setSize(h,w);
			renderer.domElement.style.transformOrigin = '0 0';
			renderer.domElement.style.transform = 'rotate(-90deg) translateX(-100%)';
		} else {
			renderer.setSize(w,h);
		}
        $("body").append(AR.renderer.domElement );
        var cube = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshNormalMaterial()
        );
        cube.position.z = 0.5;
        var cube2 = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshNormalMaterial()
        );
        cube2.position.z = 0.5;
        arController.loadMarker('./lib/data/patt.hiro.txt', function(markerId) {
            var markerRoot = AR.controller.createThreeMarker(markerId, 3);//2nd param = marker width
            markerRoot.add(cube);
            AR.markerRoot = markerRoot;
            AR.scene.scene.add(markerRoot);
        });
        arController.loadMarker('./lib/data/patt.kanji.txt', function(markerId) {
            var markerRoot = AR.controller.createThreeMarker(markerId, 3);//2nd param = marker width
            markerRoot.add(cube2);
            AR.markerRootK = markerRoot;
            AR.scene.scene.add(markerRoot);
        });
        //AR.markerRootK.children[0].getWorldPosition()

        
        AR.render();
    };
    var videoSuccess = function (video,stream) {
        AR.videoElem = video;
        AR.stream = stream;
        $("body").append(AR.videoElem);
        $(AR.videoElem).css("position","absolute");
        $(AR.videoElem).css("z-index","-1000");
    };
    ARController.getUserMediaThreeScene({
        onSuccess: getMediaSuccess,
        onVideoSuccess: videoSuccess,
        cameraParam: "./lib/data/camera_para.dat"
    });
    
};
$(document).ready(AR.beginLoad);