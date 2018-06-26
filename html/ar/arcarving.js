var AR = {
    markerRoots:[],
    saveData:[]
};
AR.render = function (){
    AR.scene.process();
    AR.scene.renderOn(AR.renderer);
    requestAnimationFrame(AR.render);
};

AR.cast = function () {
    var cnv = AR.controller.canvas;
    var cnvCtx=cnv.getContext("2d");
    var imgData=cnvCtx.getImageData(0,0,cnv.width,cnv.height);
    var data=imgData.data;
    var img = document.createElement('img');
    var url = cnv.toDataURL();
    img.src = url;
    $("#cast").append($(img));
    $(img).width("10px;");
    $(img).height("10px;");
    AR.saveData.push({
        data:data,
        img:img,
        matrixWorld:JSON.stringify(AR.markerRoots[0].matrixWorld.elements),
        matrixCamera:JSON.stringify(AR.controller.getCameraMatrix())
    });
};

AR.loadBarcode = function(barcodeNumb){
    var cube = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshNormalMaterial()
    );
    cube.material.shading = THREE.FlatShading;
    cube.position.z = 0.5;
    var markerRoot = AR.controller.createThreeBarcodeMarker(barcodeNumb, 1);
    markerRoot.add(cube);
    AR.markerRoots.push(markerRoot);
    AR.scene.scene.add(markerRoot);
    
};

AR.init = function () {
    $("#cast").text("cast");
    $("#cast").off("click");
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
            var scaleFactor = $(window).height()/h;
            renderer.domElement.style.width = (h*scaleFactor)+"px";
            renderer.domElement.style.height = (w*scaleFactor)+"px";
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
    $("#cast").on("click",function(){AR.cast();});
};
$(document).ready(function(){
    $("#cast").text("begin");
    $("#cast").show();
    $("#cast").on("click",function(){
        AR.init();
    });
});