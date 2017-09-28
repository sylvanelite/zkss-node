
var AR = {};
AR.beginLoad = function (){
    if (window.ARController && ARController.getUserMediaThreeScene) {
        AR.init();
    }
};
AR.render = function (){
    AR.scene.process();
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
        arController.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX);
        var renderer = new THREE.WebGLRenderer({antialias: true});
        AR.renderer = renderer;
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
            $(AR.renderer.domElement).css("transform","rotate(-90deg)");
        });
        arController.loadMarker('./lib/data/patt.kanji.txt', function(markerId) {
            var markerRoot = AR.controller.createThreeMarker(markerId, 3);//2nd param = marker width
            markerRoot.add(cube2);
            AR.markerRootK = markerRoot;
            AR.scene.scene.add(markerRoot);
        });
            
        //if (AR.controller.orientation === 'portrait') {
        var w = (window.innerWidth / AR.controller.videoHeight) * AR.controller.videoWidth;
        var h = window.innerWidth;
        AR.renderer.setSize(w, h);

        //AR.renderer.domElement.style.paddingBottom = (w-h) + 'px';
        
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