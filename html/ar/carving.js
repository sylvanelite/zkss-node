//https://github.com/rahulthawal/Space-Carving/blob/master/project_loop.m

//% Obtain projection matrix for camera iCam
var P = getProjMatrix( iCam );

//% Index for image points
var i = 1;

//% Sample 3-D points within a cube shape centered at the origin
for (var X = -1;  X<1;X+=0.2){
    for (var Y = -1;Y<1;Y+=0.2){
        for (var Z = -1;Z<1;Z+=0.2){
            //% Project 3-D points to image points
            var x = P * [ X, Y, Z, 1 ];//';//' = ctranspose
            //% Transform homogeneous coords into cartesian
            var u[ i ] = x[1]/x[3];
            var v[ i ] = x[2]/x[3];
            //% update index for image-point list
            i+=1;
        }
    }
}

//% Display image.
//figure, imshow( Cam( iCam ).im );

//hold on;
//plot(u,v,'yo','LineWidth',3)
