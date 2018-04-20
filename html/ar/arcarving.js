var AR = {
    VOXEL_COUNT:20,
    markerRoots:[],
    voxels:[]
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
        if(m1.visible){
            //TODO: Call cast(), at the moment call it via console
        }
    }
    AR.scene.renderOn(AR.renderer);
    requestAnimationFrame(AR.render);
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
AR.cast = function () {
    var cnv = AR.controller.canvas;
    var cnvCtx=cnv.getContext("2d");
    var imgData=cnvCtx.getImageData(0,0,cnv.width,cnv.height);
    var data=imgData.data;
    var size = AR.voxels.length;
    for(var i=0;i<size;i+=1){
        for(var j=0;j<size;j+=1){
            for(var k=0;k<size;k+=1){
                var vox = AR.voxels[i][j][k];
                var pos = AR.toScreenPosition(vox);
                //p.x = index / 3;
                //p.y = index % 3;
                //int oneDindex = (row * length_of_row) + column;
                var idx = (Math.floor(pos.y)*cnv.width)+Math.floor(pos.x);
                idx = idx*4;
                var colour = {r:data[idx],g:data[idx+1],b:data[idx+2]};
                if(colour.r===undefined){console.log(pos,idx);}
                if(colour.g>200){
                    vox.visible=false;
                }
            }
        }
    }
};

AR.capture = function () {
    var result = {};
    if(!AR.hasOwnProperty("captures")){
        AR.captures = [];
        AR.captureImages = [];
    }
    result.projectionMatrix = AR.controller.getCameraMatrix();
    result.transformMatrix = AR.controller.getTransformationMatrix();
    result.markerTransformMatrix = AR.controller.getMarkerTransformationMatrix();
    var threeTransformMat = new THREE.Matrix4();
    threeTransformMat=threeTransformMat.set(result.transformMatrix[0],result.transformMatrix[1],result.transformMatrix[2],result.transformMatrix[3],
        result.transformMatrix[4],result.transformMatrix[5],result.transformMatrix[6],result.transformMatrix[7],
        result.transformMatrix[8],result.transformMatrix[9],result.transformMatrix[10],result.transformMatrix[11],
        result.transformMatrix[12],result.transformMatrix[13],result.transformMatrix[14],result.transformMatrix[15]);
    var threeProjMat = new THREE.Matrix4();
    threeProjMat=threeProjMat.set(result.projectionMatrix[0],result.projectionMatrix[1],result.projectionMatrix[2],result.projectionMatrix[3],
        result.projectionMatrix[4],result.projectionMatrix[5],result.projectionMatrix[6],result.projectionMatrix[7],
        result.projectionMatrix[8],result.projectionMatrix[9],result.projectionMatrix[10],result.projectionMatrix[11],
        result.projectionMatrix[12],result.projectionMatrix[13],result.projectionMatrix[14],result.projectionMatrix[15]);
    var threeResult = threeTransformMat.multiply(threeProjMat);
    result.multiplyMatrix = threeResult.elements;
    AR.captures.push(result);
    var cnv = AR.controller.canvas;
    AR.captureImages.push(cnv.toDataURL());
    console.log("capture ID: "+(AR.captures.length-1));
};
AR.loadBarcode = function(barcodeNumb){
    var markerRoot = AR.controller.createThreeBarcodeMarker(barcodeNumb, 1);
    AR.generateVoxels(AR.VOXEL_COUNT);
    markerRoot.add(AR.voxelGroup);
    AR.markerRoots.push(markerRoot);
    AR.scene.scene.add(markerRoot);
};
AR.generateVoxels = function (size){
    var scale = 0.05;
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
                mesh.position.x = j*scale-(size*scale);
                mesh.position.y = k*scale-(size*scale);
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
    $("#capture").on("click",AR.capture);
    $("#cast").on("click",AR.cast);
};
$(document).ready(AR.beginLoad);