/*
ideas:
var m = AR.markerRoots[0].matrixWorld
var i = m.getInverse(m)
var vec = new THREE.Vector3(0,0,0)
vec.setFromMatrixPosition(i)

//projection??
var p = i.multiplyMatrices(i,AR.scene.camera.projectionMatrix)

var vec = new THREE.Vector3(0,0,0)
vec.setFromMatrixPosition(p

//------

https://pdfs.semanticscholar.org/d039/7b127b0777807295ef8a0b438727fb2c76a6.pdf
https://github.com/AlexFish89/iPhone-3D-scanner

var K = AR.scene.camera.projectionMatrix

var R = AR.markerRoots[0].getWorldRotation()
var T = AR.markerRoots[0].getWorldPosition()
//??
var P = [k,0]*[R,T
               0,1]

foreach voxel
voxHomg = [x,y,z,1](vertical matrix)

var pv = P*voxHomg

var norm = [pv.x/pv.z (this is "u"), pv.y/pv.z (this is "v")](vertial matrix)


//---

https://threejs.org/examples/#webgl_interactive_voxelpainter

when getting both AR cards, fill between them with voxels toward the camera
then at each screenshot step, ray cast from camera into grid and delete voxels with matching colour?


*/

var AR = {
    markerRoots:[],
    voxels:[]
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
        if(m1.visible && m2.visible){
        }
    }
    AR.scene.renderOn(AR.renderer);
    requestAnimationFrame(AR.render);
};
AR.loadBarcode = function(barcodeNumb){
    var mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.7, 1, 1),
        new THREE.MeshNormalMaterial()
    );
    mesh.material.shading = THREE.FlatShading;
    mesh.position.z = 0.7;
    if(barcodeNumb==5){
        mesh = new THREE.Mesh(
            new THREE.TorusGeometry(0.3*2.5, 0.2*2.0, 8, 8),
            new THREE.MeshNormalMaterial()
        );
        mesh.material.shading = THREE.FlatShading;
        mesh.position.z = 1.25;
        mesh.rotation.x = Math.PI/2;
    }
    var markerRoot = AR.controller.createThreeBarcodeMarker(barcodeNumb, 1);
    markerRoot.add(mesh);
    if(barcodeNumb===5){
        AR.generateVoxels(10);
        markerRoot.add(AR.voxelGroup);
    }
    AR.markerRoots.push(markerRoot);
    AR.scene.scene.add(markerRoot);
};
AR.generateVoxels = function (size){
    var scale = 0.1;
    AR.voxels=[];
    AR.voxelGroup = new THREE.Group();
    for(var i=0;i<size;i+=1){
        var x=[];
        for(var j=0;j<size;j+=1){
            var y=[];
            for(var k=0;k<size;k+=1){
                var mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(scale,scale,scale),
                    new THREE.MeshNormalMaterial()
                );
                mesh.material.shading = THREE.FlatShading;
                mesh.position.z = i*scale;
                mesh.position.x = j*scale;
                mesh.position.y = k*scale;
                y.push(mesh);
                AR.voxelGroup.add(mesh);
            }
            x.push(y);
        }
        AR.voxels.push(x);
    }
    AR.scene.scene.add(AR.voxelGroup);
};
AR.init = function () {
    var getMediaSuccess = function (arScene, arController, arCamera){
        AR.scene = arScene;
        AR.controller = arController;
        AR.camera = arCamera;
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
        AR.loadBarcode(5);
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