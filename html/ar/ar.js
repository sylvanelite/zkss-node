
var AR = {
    markerRoots:[]
};
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
    if(AR.markerRoots.length>1){
        var m1=AR.markerRoots[0];
        var m2=AR.markerRoots[1];
        if(m1.visible && m1.visible){
            var coord1 = AR.toScreenPosition();
            var coord2 = AR.toScreenPosition(AR.markerRoots[1]);
            console.log(coord1,coord2);
        }
    }
    AR.scene.renderOn(AR.renderer);
    requestAnimationFrame(AR.render);
};
AR.loadKanji = function () {
    AR.controller.loadMarker('./lib/data/patt.kanji.txt', function(markerId) {
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry( 1, 16, 16 ),
            new THREE.MeshNormalMaterial()
        );
        sphere.position.z = 0.5;
        var markerRoot = AR.controller.createThreeMarker(markerId, 3);//2nd param = marker width
        markerRoot.add(sphere);
        AR.markerRoots.push(markerRoot);
        AR.scene.scene.add(markerRoot);
    });
};
AR.loadHiro = function () {
    AR.controller.loadMarker('./lib/data/patt.hiro.txt', function(markerId) {
        var cube = new THREE.Mesh(
            new THREE.BoxGeometry(1,1,1),
            new THREE.MeshNormalMaterial()
        );
        cube.position.z = 0.5;
        var markerRoot = AR.controller.createThreeMarker(markerId, 3);//2nd param = marker width
        markerRoot.add(cube);
        AR.markerRoots.push(markerRoot);
        AR.scene.scene.add(markerRoot);
    });
};
AR.loadBarcode = function(barcodeNumb){
    var icosahedron = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.7, 1, 1),
        new THREE.MeshNormalMaterial()
    );
    icosahedron.material.shading = THREE.FlatShading;
    icosahedron.position.z = 0.7;
    var markerRoot = AR.controller.createThreeBarcodeMarker(barcodeNumb, 1);
    markerRoot.add(icosahedron);
    AR.markerRoots.push(markerRoot);
    AR.scene.scene.add(markerRoot);
};
AR.loadBarcode2 = function(barcodeNumb){
    var torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.3*2.5, 0.2*2.0, 8, 8),
        new THREE.MeshNormalMaterial()
    );
    torus.material.shading = THREE.FlatShading;
    torus.position.z = 1.25;
    torus.rotation.x = Math.PI/2;
    var markerRoot = AR.controller.createThreeBarcodeMarker(barcodeNumb, 1);
    markerRoot.add(torus);
    AR.markerRoots.push(markerRoot);
    AR.scene.scene.add(markerRoot);
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
        AR.loadBarcode2(5);
        AR.loadBarcode(20);
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