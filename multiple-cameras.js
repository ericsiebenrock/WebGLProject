//array dei valori delle camere (la prima e' quella iniziale di default)
var cameras = [];
var targets = [[0,0,0]];
var up = [0,1,0];//view-up vector sempre uguale
var totalCameras=3, cameraNum=0;
/*
THETA: angolo teta di VP
PHI: angolo phi di VP
px: posizione corrente macchina in coordinata x
py: posizione corrente macchina in coordinata y
pz: posizione corrente macchina in coordinata z
*/
function updateCameraValues(D, THETA, PHI, px, py, pz){
    var camera = [D * Math.sin(PHI) * Math.cos(THETA),
        D * Math.sin(PHI) * Math.sin(THETA),
        D * Math.cos(PHI)];
        cameras[0]=camera;

        //second camera: behind the car
        /*prima la camera viene ruotata a seconda del facing della macchina
        in modo che sia sempre dietro alla macchina
        poi viene traslata alla posizione della macchina (px,py+2,pz+5)
        */
        var facingRot=m4.identity(), facingTrasl=m4.identity();
        facingRot = m4.yRotate(facingRot, degToRad(facing));
        facingTrasl = m4.translate(facingTrasl, px, py, pz);
        facingRotTrasl = m4.multiply(facingTrasl, facingRot);
        jsTraslRot = convertMatrix(facingRotTrasl);
        //il vettore iniziale rappresenta la distanza dalla macchina
        cameras[1] = matrixVectorMultiply(jsTraslRot, [0,1.5,4,1]); 
        targets[1]=[px,py+1,pz];

        //la terza camera segue la macchina (e ha come target la macchina)
        //ma ha la posizione libera (theta e phi)
        var facingTrasl=m4.identity();
        facingTrasl = m4.translate(facingTrasl, px, py, pz);
        jsFacingTrasl=convertMatrix(facingTrasl);
        cameras[2] = matrixVectorMultiply(jsFacingTrasl, [D * Math.sin(PHI) * Math.cos(THETA),
            D * Math.sin(PHI) * Math.sin(THETA),
            D * Math.cos(PHI),1]); 
        targets[2]=[px,py+1,pz];
}

function switchCamera(){
    cameraNum++;
    cameraNum = cameraNum%totalCameras;
}

