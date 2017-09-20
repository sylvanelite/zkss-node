
self.onmessage = function (msg){
    if(msg.data.hasOwnProperty("msg")){
        if(msg.data.msg==="start"){
            console.log("starting");
            importScripts('sp_main.js');
        }
    }
    if(msg.data.hasOwnProperty("data")){
        //FS.createDataFile
        console.log("got file");
        var dataURItoBytes = function(dataURI) {
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return ia;
        };
        var blob = dataURItoBytes(msg.data.data);
        Module.filesToLoad.push(blob);
    }
    
};

var Module = {
    preRun: [],
    postRun: [],
    print: (function() {
        return function(text) {
            self.postMessage({
                msg: text
            });
            if(text.indexOf("ply_main_complete")>-1){
                console.log("sending file");
                
                var data2 = FS.readFile("./fs/o/surface.ply");
                self.postMessage({
                    file: "surface.ply",
                    data:data2.buffer
                });
                
                var data3 = FS.readFile("./fs/o/surfaceclean.ply");
                self.postMessage({
                    file: "surfaceclean.ply",
                    data:data3.buffer
                });
                
            }
        };
    })(),
    printErr: function(text) {
        console.error(text);
        self.postMessage({
            msg: "Eror: "+text
        });
    },
    totalDependencies: 0,
    monitorRunDependencies: function() {}
};
Module.filesToLoad = [];
var loadFile = function() {
    FS.mkdir("./fs");
    FS.mkdir("./fs/i");
    console.log("loading files...");
    for(var i=0;i<Module.filesToLoad.length;i+=1){
        var data = Module.filesToLoad[i];
        var stream = FS.open('./fs/i/'+i+".JPG", 'w+');
        FS.write(stream, data, 0, data.length, 0);
        FS.close(stream);
    }

};
Module.preRun.push(loadFile);
