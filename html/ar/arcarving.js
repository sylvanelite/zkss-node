/*
http://answers.opencv.org/question/26596/what-does-projection-matrix-provided-by-the-calibration-represent/

http://nghiaho.com/?p=2124

https://en.wikipedia.org/wiki/Camera_resectioning

https://eprints.soton.ac.uk/258885/1/abdullah-art02.pdf

https://www.youtube.com/watch?v=9hAadMszs5k

*/



var AR = {
    VOXEL_WIDTH:128,
    VOXEL_HEIGHT:128,
    VOXEL_DEPTH:12,
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
    AR.scene.renderOn(AR.renderer);
    requestAnimationFrame(AR.render);
};

AR.toScreenPositionParticle = function(matrixWorld, pos){
    var camera = AR.scene.camera;
    var width = AR.renderer.domElement.width, height = AR.renderer.domElement.height;
    var widthHalf = width / 2, heightHalf = height / 2;
    pos = pos.applyMatrix4(matrixWorld);
    pos.project(camera);
    
    pos.x = (pos.x * widthHalf) + widthHalf;
    pos.y = - (pos.y * heightHalf) + heightHalf;
    pos.z = 0;
    return pos;
};
AR.cast = function () {
    var cnv = AR.controller.canvas;
    var cnvCtx=cnv.getContext("2d");
    var imgData=cnvCtx.getImageData(0,0,cnv.width,cnv.height);
    var data=imgData.data;
    var size = AR.voxelGroup.geometry.vertices.length;
    for(var i=0;i<size;i+=1){
        var visible=true;
        var vox = AR.voxelGroup.geometry.vertices[i];
        var copy = vox.clone();
        var pos = AR.toScreenPositionParticle(AR.voxelGroup.matrixWorld,copy);
        var idx = (Math.floor(pos.y)*cnv.width)+Math.floor(pos.x);
        idx = idx*4;
        var colour = {r:data[idx],g:data[idx+1],b:data[idx+2]};
        if(colour.r===undefined){//out of bounds vertex
            visible=false;
        }
        if(colour.g>200){//green (backing screen)
            visible=false;
        }
        if(colour.r>200&&colour.g>200&&colour.b>200){//white (marker)
            visible=false;
        }
        if(colour.g<50&&colour.r<50&&colour.b<50){//black (marker)
            visible=false;
        }
        if(!visible){
            vox.set(-999999,-999999,-999999);
        }else{
            AR.voxelGroup.geometry.colors[i].setRGB(colour.r/255,colour.g/255,colour.b/255);
        }
    }
    AR.voxelGroup.geometry.verticesNeedUpdate=true;
    AR.voxelGroup.geometry.colorsNeedUpdate=true;
};

AR.loadBarcode = function(barcodeNumb){
    var markerRoot = AR.controller.createThreeBarcodeMarker(barcodeNumb, 1);
    AR.generateVoxels();
    markerRoot.add(AR.voxelGroup);
    AR.markerRoots.push(markerRoot);
    AR.scene.scene.add(markerRoot);
};
AR.generateVoxels = function (){
    var scale = 0.05;
    AR.voxels=[];
    var geometry = new THREE.Geometry();
    for(var i=0;i<AR.VOXEL_WIDTH;i+=1){
        for(var j=0;j<AR.VOXEL_HEIGHT;j+=1){
            for(var k=0;k<AR.VOXEL_DEPTH;k+=1){
                geometry.vertices.push(
                    new THREE.Vector3(j*scale-(size*scale), k*scale-(size*scale), i*scale));
                geometry.colors.push(
                    new THREE.Color("rgb(255,0,0)"));
            }
        }
    }
    var material = new THREE.PointCloudMaterial( { vertexColors: THREE.VertexColors,size:0.1 } );
    AR.voxelGroup = new THREE.PointCloud(geometry,material);
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
            var scaleFactorX = $(window).width()/h;
            renderer.domElement.style.width = (h*scaleFactorX)+"px";
            renderer.domElement.style.height = (w*scaleFactorX)+"px";
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
    $("#cast").on("click",function(){AR.cast();});
};
$(document).ready(AR.beginLoad);