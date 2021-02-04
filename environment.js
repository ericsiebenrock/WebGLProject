var envVertBuff = [];
var envNormBuff = [];
var envIndBuff = [];
var envKaBuff = [];var envKdBuff = []; var envKsBuff = [];
var envNsBuff = [];
var envColBuff = [];
var envTexBuff = [], envTextures=[];
var entities = 0, entName = [];
var moMatrix=[], envObjInd=[];
var poleScale = [0.3,0.1,0.3], signScale=[0.4,0.4,0.01], plantScale=[0.2,0.2,0.2], pyrscale=[7,1.5,7], posPyr=[-70, 1.4, -50];
var randScale = [], randomXPos = [], randomZPos = [], sign1 = [], sign2 = [];
var plantPosX=[], plantPosZ=[], plantOrientationY=[], rot=[], rotStep=7, posStepX=0.6, posStepZ=0.6;

var changeDirZ=false, changeDirX=false;

//GEOMETRIA CARTELLO CON TEXTURE
var vertSign=[
   -1,-1,-1, 1,-1,-1, 1,1,-1, -1,1,-1, //faccia dietro
   -1,-1,1, 1,-1,1, 1,1,1, -1,1,1, //faccia davanti
   -1,-1,-1, -1,1,-1, -1,1,1, -1,-1,1,//faccia sinistra
   1,-1,-1, 1,1,-1, 1,1,1, 1,-1,1, //faccia destra
   -1,-1,-1, -1,-1,1, 1,-1,1, 1,-1,-1, //faccia sotto
   -1,1,-1, -1,1,1, 1,1,1, 1,1,-1]; //faccia sopra
//definisco normali solo nella faccia davanti(texture) e dietro
var normalSign=[
   0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, //faccia dietro
   0,0,1, 0,0,1, 0,0,1, 0,0,1, //faccia davanti
   0,0,0, 0,0,0, 0,0,0, 0,0,0,
   0,0,0, 0,0,0, 0,0,0, 0,0,0, 
   0,0,0, 0,0,0, 0,0,0, 0,0,0, 
   0,0,0, 0,0,0, 0,0,0, 0,0,0];
   var texCoords=[
      // select the top left image
      0, 0,
      0, 0,
      0, 0,
      0, 0,
      // select the top middle image
      0, 1.0  ,
      1.0 , 1.0  ,
      1.0, 0,
      0, 0,
      // select to top right image
      0, 0,
      0, 0,
      0, 0,
      0, 0,
      // select the bottom left image
      0, 0,
      0, 0,
      0, 0,
      0, 0,
      // select the bottom middle image
      0, 0,
      0, 0,
      0, 0,
      0, 0,
      // select the bottom right image
      0, 0,
      0, 0,
      0, 0,
      0, 0,
    ];
   var indSign = [
   0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11, 12,13,14, 
   12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23 ];

   //GEOMETRIA PIRAMIDE
   var vertPyr=[
      -1,-1,-1, -1,-1,1, 1,-1,1, 1,-1,-1, //base
      -1,-1,-1, -1,-1,1, 0,4,0, //lato sinistro
      -1,-1,-1, 1,-1,-1, 0,4,0, //lato dietro
      1,-1,-1, 1,-1,1, 0,4,0, //lato destro
      1,-1,1, -1,-1,1, 0,4,0 //lato davanti
   ];
   var normPyr=[
      0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
      -1,0,0, -1,0,0, -1,0,0, 
      0,0,-1, 0,0,-1, 0,0,-1,
      1,0,0, 1,0,0, 1,0,0,
      0,0,1, 0,0,1, 0,0,1
   ];
   var texPyr=[
      0.0,0.0,
      0.0,0.0,
      0.0,0.0,
      0.0,0.0,

      0.0,4.0,
      4.0,4.0,
      2.0,0.0,

      4.0,4.0,
      0.0,4.0,
      2.0,0.0,

      4.0,4.0,
      0.0,4.0,
      2.0,0.0,

      0.0,4.0,
      4.0,4.0,
      2.0,0.0,
   ];
   var indPyr=[0,1,2, 0,2,3,
   4,5,6,
   7,8,9,
   10,11,12,
   13,14,15];

function renderEnv(){
   gl.useProgram(shaderprogram2);
   gl.uniform1i(_envMappingMode, 0);
   gl.useProgram(shaderprogram);
   for(i=0;i<entities;i++){

      switch (entName[i]) {
         case 'pole':
            gl.useProgram(shaderprogram2);
            moMatrix[i] = m4.copy(mo_matrix);
            moMatrix[i] = m4.translate(moMatrix[i], -3, 0, -3);
            moMatrix[i] = m4.scale(moMatrix[i], poleScale[0], poleScale[1], poleScale[2]);
            gl.uniformMatrix4fv(_mMat, false, moMatrix[i]);
            gl.uniformMatrix4fv(_vMat, false, view_matrix);
            gl.uniformMatrix4fv(_pMat, false, proj_matrix);
            gl.uniform1i(_dirLightStateG, dirLightState);

            var mo_invTransMat = m4.transpose(m4.inverse(moMatrix[i]));
            _normalMat = m4.transpose(m4.inverse(m4.multiply(view_matrix, moMatrix[i])));

            gl.uniformMatrix4fv(_wNormMat, false, mo_invTransMat);
            gl.uniformMatrix4fv(_normMat, false, _normalMat);

            gl.bindBuffer(gl.ARRAY_BUFFER, envVertBuff[i]);
            gl.vertexAttribPointer(_vPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_vPosition);
      
            gl.bindBuffer(gl.ARRAY_BUFFER, envNormBuff[i]);
            gl.vertexAttribPointer(_vNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_vNormal);

            gl.bindBuffer(gl.ARRAY_BUFFER, envKaBuff[i]);
            gl.vertexAttribPointer(_ka, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_ka);
            gl.bindBuffer(gl.ARRAY_BUFFER, envKdBuff[i]);
            gl.vertexAttribPointer(_kd, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_kd);
            gl.bindBuffer(gl.ARRAY_BUFFER, envKsBuff[i]);
            gl.vertexAttribPointer(_ks, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_ks);
            gl.bindBuffer(gl.ARRAY_BUFFER, envNsBuff[i]);
            gl.vertexAttribPointer(_shininess, 1, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_shininess);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, envIndBuff[i]);

            gl.drawElements(gl.TRIANGLES, envObjInd[i].length, gl.UNSIGNED_SHORT, 0);
            gl.useProgram(shaderprogram);
            break;
         case 'sign':
            moMatrix[i] = m4.copy(mo_matrix);
            gl.useProgram(shaderTexProgram);


            moMatrix[i] = m4.translate(moMatrix[i], -3, 1.4, -3);
            moMatrix[i] = m4.scale(moMatrix[i], signScale[0], signScale[1], signScale[2]);
            
            gl.uniformMatrix4fv(_MmatrixTex, false, moMatrix[i]);
            gl.uniformMatrix4fv(_VmatrixTex, false, view_matrix);
            gl.uniformMatrix4fv(_PmatrixTex, false, proj_matrix);

            var mo_invTransMatT=m4.transpose(m4.inverse(moMatrix[i]));
            gl.uniformMatrix4fv(_worldInverseTransposeTex, false, mo_invTransMatT);
            mo_invTransMatT = m4.multiply(view_matrix,moMatrix[i]);
            mo_invTransMatT = m4.transpose(m4.inverse(mo_invTransMatT));
            gl.uniformMatrix4fv(_inverseTransposeTex, false, mo_invTransMatT);

            gl.bindBuffer(gl.ARRAY_BUFFER, envVertBuff[i]);
            gl.vertexAttribPointer(_positionTex, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_positionTex);

            gl.bindBuffer(gl.ARRAY_BUFFER, envNormBuff[i]);
            gl.vertexAttribPointer(_normalTex, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_normalTex);

            gl.uniform4fv(_matKaTex, kaTex);
            gl.uniform4fv(_matKdTex, kdTex);
      
            gl.bindBuffer(gl.ARRAY_BUFFER, envTexBuff[i]);
            gl.vertexAttribPointer(_texCoordTex, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_texCoordTex);
      
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, envIndBuff[i]);
            
            //use texture location 1
            gl.uniform1i(_textureLocation, 1);

            gl.drawElements(gl.TRIANGLES, envObjInd[i].length, gl.UNSIGNED_SHORT, 0);

            gl.useProgram(shaderprogram);//resetting the default shader program
            break;
         case 'pyramid':
            moMatrix[i] = m4.copy(mo_matrix);
            gl.useProgram(shaderTexProgram);

            moMatrix[i] = m4.translate(moMatrix[i], posPyr[0], posPyr[1], posPyr[2]);
            moMatrix[i] = m4.scale(moMatrix[i], pyrscale[0], pyrscale[1], pyrscale[2]);
            
            gl.uniformMatrix4fv(_MmatrixTex, false, moMatrix[i]);
            gl.uniformMatrix4fv(_VmatrixTex, false, view_matrix);
            gl.uniformMatrix4fv(_PmatrixTex, false, proj_matrix);

            // var mo_invTransMatT=m4.transpose(m4.inverse(moMatrix[i]));
            gl.uniformMatrix4fv(_worldInverseTransposeTex, false, m4.transpose(m4.inverse(moMatrix[i])));
            gl.uniformMatrix4fv(_inverseTransposeTex, false, m4.transpose(m4.inverse(m4.multiply(view_matrix,moMatrix[i]))));

            gl.bindBuffer(gl.ARRAY_BUFFER, envVertBuff[i]);
            gl.vertexAttribPointer(_positionTex, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_positionTex);

            gl.bindBuffer(gl.ARRAY_BUFFER, envNormBuff[i]);
            gl.vertexAttribPointer(_normalTex, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_normalTex);

            gl.uniform4fv(_matKaTex, kaTex);
            gl.uniform4fv(_matKdTex, kdTex);
      
            gl.bindBuffer(gl.ARRAY_BUFFER, envTexBuff[i]);
            gl.vertexAttribPointer(_texCoordTex, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(_texCoordTex);
      
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, envIndBuff[i]);
            
            gl.uniform1i(_textureLocation, 2);

            gl.drawElements(gl.TRIANGLES, envObjInd[i].length, gl.UNSIGNED_SHORT, 0);

            gl.useProgram(shaderprogram);//resetting the default shader program
            break;
         case 'cactus':
            gl.useProgram(shaderprogram2);
            for(k=0;k<30;k++){
               moMatrix[i] = m4.identity();
               moMatrix[i] = m4.translate(moMatrix[i], sign1[0][k]*randomXPos[0][k], 0, sign2[0][k]*randomZPos[0][k]);
               moMatrix[i] = m4.scale(moMatrix[i], randScale[0][k], randScale[0][k], randScale[0][k]);
               gl.uniformMatrix4fv(_mMat, false, moMatrix[i]);
               gl.uniformMatrix4fv(_vMat, false, view_matrix);
               gl.uniformMatrix4fv(_pMat, false, proj_matrix);
               gl.uniform1i(_dirLightStateG, dirLightState);
               
               
               var mo_invTransMat=m4.transpose(m4.inverse(moMatrix[i])); 
               _normalMat=m4.transpose(m4.inverse(m4.multiply(view_matrix, moMatrix[i]))); 
               
               gl.uniformMatrix4fv(_wNormMat, false, mo_invTransMat);
               gl.uniformMatrix4fv(_normMat, false, _normalMat);

               gl.bindBuffer(gl.ARRAY_BUFFER, envVertBuff[i]);
               gl.vertexAttribPointer(_vPosition, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_vPosition);
         
               gl.bindBuffer(gl.ARRAY_BUFFER, envNormBuff[i]);
               gl.vertexAttribPointer(_vNormal, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_vNormal);

               gl.bindBuffer(gl.ARRAY_BUFFER, envKaBuff[i]);
               gl.vertexAttribPointer(_ka, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_ka);
               gl.bindBuffer(gl.ARRAY_BUFFER, envKdBuff[i]);
               gl.vertexAttribPointer(_kd, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_kd);
               gl.bindBuffer(gl.ARRAY_BUFFER, envKsBuff[i]);
               gl.vertexAttribPointer(_ks, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_ks);
               gl.bindBuffer(gl.ARRAY_BUFFER, envNsBuff[i]);
               gl.vertexAttribPointer(_shininess, 1, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_shininess);
         
               gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, envIndBuff[i]);

               gl.drawElements(gl.TRIANGLES, envObjInd[i].length, gl.UNSIGNED_SHORT, 0);
            }
            gl.useProgram(shaderprogram);
            break;
         case 'rock':
            gl.useProgram(shaderprogram2);
            for(k=0;k<30;k++){
               moMatrix[i] = m4.identity();
               moMatrix[i] = m4.translate(moMatrix[i], sign1[1][k]*randomXPos[1][k], 0, sign2[1][k]*randomZPos[1][k]);
               moMatrix[i] = m4.scale(moMatrix[i], randScale[1][k], randScale[1][k], randScale[1][k]);
               gl.uniformMatrix4fv(_mMat, false, moMatrix[i]);
               gl.uniformMatrix4fv(_vMat, false, view_matrix);
               gl.uniformMatrix4fv(_pMat, false, proj_matrix);
               gl.uniform1i(_dirLightStateG, dirLightState);
               
               var mo_invTransMat=m4.transpose(m4.inverse(moMatrix[i])); 
               _normalMat=m4.transpose(m4.inverse(m4.multiply(view_matrix, moMatrix[i]))); 
               
               gl.uniformMatrix4fv(_wNormMat, false, mo_invTransMat);
               gl.uniformMatrix4fv(_normMat, false, _normalMat);

               gl.bindBuffer(gl.ARRAY_BUFFER, envVertBuff[i]);
               gl.vertexAttribPointer(_vPosition, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_vPosition);
         
               gl.bindBuffer(gl.ARRAY_BUFFER, envNormBuff[i]);
               gl.vertexAttribPointer(_vNormal, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_vNormal);

               gl.bindBuffer(gl.ARRAY_BUFFER, envKaBuff[i]);
               gl.vertexAttribPointer(_ka, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_ka);
               gl.bindBuffer(gl.ARRAY_BUFFER, envKdBuff[i]);
               gl.vertexAttribPointer(_kd, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_kd);
               gl.bindBuffer(gl.ARRAY_BUFFER, envKsBuff[i]);
               gl.vertexAttribPointer(_ks, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_ks);
               gl.bindBuffer(gl.ARRAY_BUFFER, envNsBuff[i]);
               gl.vertexAttribPointer(_shininess, 1, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_shininess);
         
               gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, envIndBuff[i]);

               gl.drawElements(gl.TRIANGLES, envObjInd[i].length, gl.UNSIGNED_SHORT, 0);
            }
            gl.useProgram(shaderprogram);
            break;
         case 'plant':
            gl.useProgram(shaderprogram2);
            for(k=0;k<20;k++){
               if((plantPosX[k]<-((floorS/plantScale[0])-5)&&!changeDirX) || (plantPosX[k]>((floorS/plantScale[0])-5)&&!changeDirX)) {
                  changeDirX=true;
                  plantOrientationY[k] *= -1;
               }
               else if(plantPosX[k]<((floorS/plantScale[0])-5) && plantPosX[k] > -((floorS/plantScale[0])-5)) changeDirX=false;
               if((plantPosZ[k]>((floorS/plantScale[0])-5) && !changeDirZ) || (plantPosZ[k]<-((floorS/plantScale[0])-5) && !changeDirZ)) {
                  changeDirZ=true;
                  plantOrientationY[k] = 180-plantOrientationY[k];
               }
               else if(plantPosZ[k]<((floorS/plantScale[0])-5) && plantPosZ[k] > -((floorS/plantScale[0])-5)) changeDirZ=false;
               cosf = Math.cos(degToRad(plantOrientationY[k]));
               sinf = Math.sin(degToRad(plantOrientationY[k]));
               velX = sinf * posStepX;
               velZ = cosf * posStepZ;
               plantPosX[k]+=velX;
               plantPosZ[k]+=velZ;

               moMatrix[i]=m4.identity();
               moMatrix[i]=m4.scale(moMatrix[i], plantScale[0], plantScale[1], plantScale[2]);
               moMatrix[i] = m4.translate(moMatrix[i], plantPosX[k], 1.8, plantPosZ[k]);
               moMatrix[i] = m4.yRotate(moMatrix[i], degToRad(plantOrientationY[k]));
               moMatrix[i] = m4.xRotate(moMatrix[i], degToRad(rot[k]));
               
               gl.uniformMatrix4fv(_mMat, false, moMatrix[i]);
               gl.uniformMatrix4fv(_vMat, false, view_matrix);
               gl.uniformMatrix4fv(_pMat, false, proj_matrix);
               gl.uniform1i(_dirLightStateG, dirLightState);
               
               var mo_invTransMat=m4.transpose(m4.inverse(moMatrix[i])); 
               _normalMat=m4.transpose(m4.inverse(m4.multiply(view_matrix, moMatrix[i]))); 
               
               gl.uniformMatrix4fv(_wNormMat, false, mo_invTransMat);
               gl.uniformMatrix4fv(_normMat, false, _normalMat);

               gl.bindBuffer(gl.ARRAY_BUFFER, envVertBuff[i]);
               gl.vertexAttribPointer(_vPosition, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_vPosition);
         
               gl.bindBuffer(gl.ARRAY_BUFFER, envNormBuff[i]);
               gl.vertexAttribPointer(_vNormal, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_vNormal);

               gl.bindBuffer(gl.ARRAY_BUFFER, envKaBuff[i]);
               gl.vertexAttribPointer(_ka, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_ka);
               gl.bindBuffer(gl.ARRAY_BUFFER, envKdBuff[i]);
               gl.vertexAttribPointer(_kd, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_kd);
               gl.bindBuffer(gl.ARRAY_BUFFER, envKsBuff[i]);
               gl.vertexAttribPointer(_ks, 3, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_ks);
               gl.bindBuffer(gl.ARRAY_BUFFER, envNsBuff[i]);
               gl.vertexAttribPointer(_shininess, 1, gl.FLOAT, false, 0, 0);
               gl.enableVertexAttribArray(_shininess);
         
               gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, envIndBuff[i]);

               gl.drawElements(gl.TRIANGLES, envObjInd[i].length, gl.UNSIGNED_SHORT, 0);
               rot[k]+=rotStep%180;
            }
            gl.useProgram(shaderprogram);
            break;
         default:
            break;
      }
   }
}

function loadEnv() {
   //LOADING STATIC ENVIRONMENT (sign)
   envVertBuff[entities]=gl.createBuffer();
   envNormBuff[entities]=gl.createBuffer();
   envTexBuff[entities]=gl.createBuffer();
   envTextures[entities]=gl.createTexture();
   envColBuff[entities]=gl.createBuffer();
   envIndBuff[entities]=gl.createBuffer();
   envObjInd[entities]=indSign;

   gl.bindBuffer(gl.ARRAY_BUFFER, envVertBuff[entities]);
   gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(vertSign), gl.STATIC_DRAW);

   gl.bindBuffer(gl.ARRAY_BUFFER, envNormBuff[entities]);
   gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(normalSign), gl.STATIC_DRAW);

   //TEXTURE   
   gl.bindBuffer(gl.ARRAY_BUFFER, envTexBuff[entities]);
   gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(texCoords), gl.STATIC_DRAW);
   gl.bindTexture(gl.TEXTURE_2D, envTextures[entities]);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                 new Uint8Array([0, 0, 255, 255]));
   loadTexture('./resources/images/Eric2.png', entities);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, envIndBuff[entities]);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(envObjInd[entities]), gl.STATIC_DRAW);

   entName[entities]='sign';
   entities++;

   //LOADING STATIC ENVIRONMENT (PYRAMID)
   envVertBuff[entities]=gl.createBuffer();
   envNormBuff[entities]=gl.createBuffer();
   envTexBuff[entities]=gl.createBuffer();
   envTextures[entities]=gl.createTexture();
   envColBuff[entities]=gl.createBuffer();
   envIndBuff[entities]=gl.createBuffer();
   envObjInd[entities]=indPyr;

   gl.bindBuffer(gl.ARRAY_BUFFER, envVertBuff[entities]);
   gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(vertPyr), gl.STATIC_DRAW);

   gl.bindBuffer(gl.ARRAY_BUFFER, envNormBuff[entities]);
   gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(normPyr), gl.STATIC_DRAW);

   //TEXTURE   
   gl.bindBuffer(gl.ARRAY_BUFFER, envTexBuff[entities]);
   gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(texPyr), gl.STATIC_DRAW);
   gl.bindTexture(gl.TEXTURE_2D, envTextures[entities]);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                 new Uint8Array([0, 0, 255, 255]));
   loadTexture('./resources/images/pyramid.png', entities);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, envIndBuff[entities]);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(envObjInd[entities]), gl.STATIC_DRAW);

   entName[entities]='pyramid';
   entities++;

   // LOADING ENVIRONMENT FROM OBJ
   $.ajax({
      url: './resources/data/pole.obj',
      success: function (data) {
         $.ajax({
            url: './resources/data/pole.mtl',
            success: function (mtlData) {
               storeObjEnvMat(data, mtlData, 'pole')
            }
         });
      }
   });

   $.ajax({
      url: './resources/data/cactus.obj',
      success: function (data) {
         $.ajax({
            url: './resources/data/cactus.mtl',
            success: function (mtlData) {
               storeObjEnvMat(data, mtlData, 'cactus')
            }
         });
      }
   });

   $.ajax({
      url: './resources/data/rock.obj',
      success: function (data) {
         $.ajax({
            url: './resources/data/rock.mtl',
            success: function (mtlData) {
               storeObjEnvMat(data, mtlData, 'rock')
            }
         });
      }
   });
   $.ajax({
      url: './resources/data/plant.obj',
      success: function (data) {
         $.ajax({
            url: './resources/data/plant.mtl',
            success: function (mtlData) {
               storeObjEnvMat(data, mtlData, 'plant')
            }
         });
      }
   });

   initializeRandomScalePos(2,20);
}

function loadTexture(imgPath, texIndex){
   var image = new Image();
   image.src = imgPath;
   image.addEventListener('load', function() {
     if(texIndex==0) gl.activeTexture(gl.TEXTURE1);//texture location 1 (sign)
     else if(texIndex==1) gl.activeTexture(gl.TEXTURE2);//texture lpcation 2 (pyramid)
     gl.bindTexture(gl.TEXTURE_2D, envTextures[texIndex]);
 
     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
 
     if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
     } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
     }
   });
}

function storeObjEnvMat(data, mtlData, entityName) {
   var nvert, nface, objVert = [];
   var nnorm, objNorm = [];
   var nsVert = [], kaVert = [], kdVert = [], ksVert = [], numVert;
   var material=false;
   envObjInd[entities] = [];

   mesh = ReadOBJ(data, mtlData, mesh);
   //mesh = LoadSubdivMesh(mesh);

   nvert = mesh.nvert;
   nnorm = mesh.nnorm;
   nface = mesh.nface;

   //INDICI
   var k = 0;
   for (var i = 1; i <= nface; i++) {
      //mesh.face[i].n_v_e: numero vertici di quella faccia (devono essere facce triangolari)
      if (mesh.face[i].n_v_e == 3) {
         for (t = 0; t < 3; t++) {
            vertIndex = mesh.face[i].vert[t] - 1; //es il primo vertice (vertIndex=0), -1 necessario perchè il formato obj conta partendo da 1 e non da 0
            normVertIndex = mesh.face[i].norm[t] - 1;
            numVert = vertIndex * 3;

            if (mesh.face[i].material) {
               material=true;
               kaVert[numVert] = mesh.face[i].material.ka[0]; kdVert[numVert] = mesh.face[i].material.kd[0]; ksVert[numVert] = mesh.face[i].material.ks[0];
               kaVert[numVert + 1] = mesh.face[i].material.ka[1]; kdVert[numVert + 1] = mesh.face[i].material.kd[1]; ksVert[numVert + 1] = mesh.face[i].material.ks[1];
               kaVert[numVert + 2] = mesh.face[i].material.ka[2]; kdVert[numVert + 2] = mesh.face[i].material.kd[2]; ksVert[numVert + 2] = mesh.face[i].material.ks[2];
               nsVert[vertIndex] = mesh.face[i].material.ns;
            }
            //salvataggio valori delle normali per ogni vertice (es vertice uno: objVert=[x,y,z,x2,y2,z2......] objNorm=[xn,yn,zn,xn2,yn2,zn2........] 
            //ns=[ns,ns2....])

            objVert[numVert] = mesh.vert[vertIndex + 1].x;
            objVert[numVert + 1] = mesh.vert[vertIndex + 1].y;
            objVert[numVert + 2] = mesh.vert[vertIndex + 1].z;
            if(entityName == 'cactus'){
               //lieve bump mapping manuale per rendere il cactus piu' realistico
               xNorm = mesh.norm[normVertIndex + 1].x;
               yNorm = mesh.norm[normVertIndex + 1].y;
               zNorm = mesh.norm[normVertIndex + 1].z;
               if(xNorm==Math.max(xNorm,yNorm,zNorm))objNorm[numVert]=xNorm+getRandomArbitrary(-0.5,1.0);
               else objNorm[numVert]=xNorm;
               if(yNorm==Math.max(xNorm,yNorm,zNorm))objNorm[numVert + 1]=yNorm+getRandomArbitrary(-0.5,1.0);
               else objNorm[numVert + 1]=yNorm;
               if(zNorm==Math.max(xNorm,yNorm,zNorm))objNorm[numVert + 2]=zNorm+getRandomArbitrary(-0.5,1.0);
               else objNorm[numVert + 2]=zNorm;
            }
            else{
               objNorm[numVert] = mesh.norm[normVertIndex + 1].x;
               objNorm[numVert + 1] = mesh.norm[normVertIndex + 1].y;
               objNorm[numVert + 2] = mesh.norm[normVertIndex + 1].z;
            }

            envObjInd[entities][k] = vertIndex;
            k++;
         }
      }
   }
   envVertBuff[entities] = gl.createBuffer();
   envNormBuff[entities] = gl.createBuffer();
   envIndBuff[entities] = gl.createBuffer();
   envKaBuff[entities] = gl.createBuffer();
   envKdBuff[entities] = gl.createBuffer();
   envKsBuff[entities] = gl.createBuffer();
   envNsBuff[entities] = gl.createBuffer();

   gl.bindBuffer(gl.ARRAY_BUFFER, envVertBuff[entities]);
   gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(objVert), gl.STATIC_DRAW);

   gl.bindBuffer(gl.ARRAY_BUFFER, envNormBuff[entities]);
   gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(objNorm), gl.STATIC_DRAW);

   if(material){
      gl.bindBuffer(gl.ARRAY_BUFFER, envKaBuff[entities]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(kaVert), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, envKdBuff[entities]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(kdVert), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, envKsBuff[entities]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ksVert), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, envNsBuff[entities]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nsVert), gl.STATIC_DRAW);
   }

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, envIndBuff[entities]);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(envObjInd[entities]), gl.STATIC_DRAW);

   entName[entities] = entityName;
   entities++;
}

function initializeRandomScalePos(numItems, numPlants){
   for(j=0;j<numItems;j++){
      randScale[j]=[];
      randomXPos[j]=[];
      randomZPos[j]=[];
      sign1[j]=[];
      sign2[j]=[];
      for(i=0;i<30;i++){
         randScale[j][i] = getRandomArbitrary(0.1, 0.7);
         //controlli per non intersecare piramide
         do{
         randomXPos[j][i] = getRandomArbitrary(10, 95);
         sign1[j][i] = getRandomInt(0, 1)==0? -1 : 1;
         }while((sign1[j][i]*randomXPos[j][i])>-80 && (sign1[j][i]*randomXPos[j][i])<-60);
         do{
         randomZPos[j][i] = getRandomArbitrary(10, 95);
         sign2[j][i] = getRandomInt(0, 1)==0? -1 : 1;
         }while((sign2[j][i]*randomZPos[j][i])>-60 && (sign2[j][i]*randomZPos[j][i])<-40);
      }
   }
   for(k=0;k<numPlants;k++){
      plantPosX[k]=getRandomInt(-400,400);
      plantPosZ[k]=getRandomInt(-400,400);
      plantOrientationY[k]=getRandomInt(0,360);
      rot[k]=0;
   }
}
