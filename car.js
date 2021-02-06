// STATO DELLA MACCHINA
// (DoStep fa evolvere queste variabili nel tempo)
// px,py,pz: posizione e facing: orientamento macchina (angolo che forma con asse z, inizialmente 0)
var px, py, pz, facing;
/*mozzoA(P): rotazione/angolo corrente della ruota anteriore (posteriore)
sterzo: sterzo corrente delle ruote
*/
var mozzoA, mozzoP, sterzo; // stato interno
var vx, vy, vz; // velocita' attuale nelle tre direzioni

// queste di solito rimangono costanti
/*
grip: attrito delle ruote durante lo sterzo (quanto velocemente la macchina si adegua allo sterzo)
attrito: al momento non viene usato
raggi: usati per calcolare le velocita' angolari delle ruote
*/
var velSterzo, velRitornoSterzo, accMax,
   raggioRuotaA, raggioRuotaP, grip,
   attritoX, attritoY, attritoZ; // attriti nelle varie direzioni
var key; // tasto premuto


// DoStep: facciamo un passo di fisica (a delta-t costante)
//
// Indipendente dal rendering. (chiamata ogni volta da update anche se non si chiama render)
// la struttura controller da DoStep
function CarDoStep() {
   // computiamo l'evolversi della macchina

   var vxm, vym, vzm; // velocita' in spazio macchina

   // da vel frame mondo a vel frame macchina
   var cosf = Math.cos(facing * Math.PI / 180.0);
   var sinf = Math.sin(facing * Math.PI / 180.0);
   vxm = +cosf * vx - sinf * vz;
   vym = vy;
   vzm = +sinf * vx + cosf * vz;

   // gestione dello sterzo
   //velSterzo=A e velRitornoSterzo=B
   //sterzo massimo = A*B/(1-B) dato che velRitornoSterzo e' applicato sempre
   if (key[1]) sterzo += velSterzo;
   if (key[3]) sterzo -= velSterzo;
   sterzo *= velRitornoSterzo; // ritorno a volante fermo

   
   if (key[0]) vzm -= accMax; // accelerazione in avanti
   if (key[2]) vzm += accMax; // accelerazione indietro

   // attriti (semplificando)
   vxm *= attritoX;
   vym *= attritoY;
   vzm *= attritoZ;

   // l'orientamento della macchina segue quello dello sterzo
   // (a seconda della velocita' sulla z, ovvero la velocita' della macchina)
   facing = facing - (vzm * grip) * sterzo;

   // rotazione mozzo ruote (a seconda della velocita' sulla z)
   var da; //delta angolo
   da = (180.0 * vzm) / (Math.PI * raggioRuotaA);
   mozzoA += da;
   da = (180.0 * vzm) / (Math.PI * raggioRuotaP);
   mozzoP += da;

   // ritorno a vel coord mondo (per calcolare posizione in coordinate mondo)
   vx = +cosf * vxm + sinf * vzm;
   vy = vym;
   vz = -sinf * vxm + cosf * vzm;

   //calcolo posizione in coordinate mondo
   // posizione = posizione + velocita * delta t (ma e' delta t costante)
   px += vx;
   py += vy;
   pz += vz;
}

function CarInit() {
   // inizializzo lo stato della macchina
   px = py = pz = facing = 0; // posizione e orientamento iniziali
   mozzoA = mozzoP = sterzo = 0;   // stato
   vx = vy = vz = 0;      // velocita' attuale
   // inizializzo la struttura di controllo
   key = [false, false, false, false];

   velSterzo = 3.4;         // A
   //  velSterzo=2.26;       // A
   velRitornoSterzo = 0.93; // B, sterzo massimo = A*B / (1-B)

   accMax = 0.003;
   //accMax = 0.0055;

   // attriti: percentuale di velocita' che viene mantenuta
   // 1 = no attrito
   // <<1 = attrito grande
   attritoZ = 0.991;  // piccolo attrito sulla Z (nel senso di rotolamento delle ruote)
   attritoX = 0.9;  // grande attrito sulla X (per non fare slittare la macchina)
   attritoY = 1.0;  // attrito sulla y nullo

   // Nota: vel max = accMax*attritoZ / (1-attritoZ)

   raggioRuotaA = 0.30;
   raggioRuotaP = 0.30;

   grip = 0.45; // quanto il facing macchina si adegua velocemente allo sterzo
}

function updateCarLights(px, py, pz) {
   var facingRot = m4.identity(), facingTrasl = m4.identity();
   facingRot = m4.yRotate(facingRot, degToRad(facing));
   facingTrasl = m4.translate(facingTrasl, px, py, pz);
   facingRotTrasl = m4.multiply(facingTrasl, facingRot);
   jsTraslRot = convertMatrix(facingRotTrasl);
   //vettore iniziale rappresenta la posizione rispetto alla macchina
   spotLightPosition = matrixVectorMultiply(jsTraslRot, [0.0,2.0,0.0,1.0]);
   spotLightDirection = matrixVectorMultiply(convertMatrix(facingRot), [0.0,-0.2,-0.8,1.0]);
}

function renderChassisGrouraud(){
   gl.useProgram(shaderprogram2);
   mo_matrixC = m4.copy(mo_matrix);
   mo_matrixC = m4.translate(mo_matrixC, px, py, pz);
   mo_matrixC = m4.yRotate(mo_matrixC, degToRad(facing));
   gl.uniformMatrix4fv(_mMat, false, mo_matrixC);
   var modelView = m4.multiply(view_matrix,mo_matrixC);
   gl.uniformMatrix4fv(_normMat, false, m4.transpose(m4.inverse(modelView)));
   gl.uniformMatrix4fv(_wNormMat, false, m4.transpose(m4.inverse(mo_matrixC)));

   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_bufferC);
   gl.vertexAttribPointer(_vPosition, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_vPosition);

   gl.bindBuffer(gl.ARRAY_BUFFER, ka_bufferC);
   gl.vertexAttribPointer(_ka, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_ka);
   gl.bindBuffer(gl.ARRAY_BUFFER, kd_bufferC);
   gl.vertexAttribPointer(_kd, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_kd);
   gl.bindBuffer(gl.ARRAY_BUFFER, ks_bufferC);
   gl.vertexAttribPointer(_ks, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_ks);
   gl.bindBuffer(gl.ARRAY_BUFFER, ns_bufferC);
   gl.vertexAttribPointer(_shininess, 1, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_shininess);

   gl.bindBuffer(gl.ARRAY_BUFFER, normal_bufferC);
   gl.vertexAttribPointer(_vNormal, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_vNormal);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_bufferC);
   gl.uniform1i(_envMappingMode, envMapping);

   gl.drawElements(gl.TRIANGLES, objIndC.length, gl.UNSIGNED_SHORT, 0);
   gl.useProgram(shaderprogram);
}

function renderChassisPhong(){
   mo_matrixC = m4.copy(mo_matrix);
   mo_matrixC = m4.translate(mo_matrixC, px, py, pz);
   mo_matrixC = m4.yRotate(mo_matrixC, degToRad(facing));
   gl.uniformMatrix4fv(_Mmatrix, false, mo_matrixC);
   var modelView = m4.multiply(view_matrix,mo_matrixC);
   gl.uniformMatrix4fv(_phongNormalMat, false, m4.transpose(m4.inverse(modelView)));
   gl.uniformMatrix4fv(_wPhongNormalMat, false, m4.transpose(m4.inverse(mo_matrixC)));

   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_bufferC);
   gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_position);

   gl.bindBuffer(gl.ARRAY_BUFFER, ka_bufferC);
   gl.vertexAttribPointer(_aKa, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKa);
   gl.bindBuffer(gl.ARRAY_BUFFER, kd_bufferC);
   gl.vertexAttribPointer(_aKd, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKd);
   gl.bindBuffer(gl.ARRAY_BUFFER, ks_bufferC);
   gl.vertexAttribPointer(_aKs, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKs);
   gl.bindBuffer(gl.ARRAY_BUFFER, ns_bufferC);
   gl.vertexAttribPointer(_ashininess, 1, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_ashininess);

   gl.bindBuffer(gl.ARRAY_BUFFER, normal_bufferC);
   gl.vertexAttribPointer(_vertNormal, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_vertNormal);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_bufferC);

   gl.uniform1i(_envMapMode, envMapping);//attiva/disattiva l'env mapping
   gl.drawElements(gl.TRIANGLES, objIndC.length, gl.UNSIGNED_SHORT, 0);
}

function renderObjCar(carScaling) {
   mo_matrix = m4.scale(mo_matrix, carScaling[0], carScaling[1], carScaling[2]);//scala la macchina (e le ruote)

   //carlinga
   if(shadingMode=='gouraud'){
      renderChassisGrouraud();
   }
   else renderChassisPhong();

   //ruotaASX
   mo_matrixTASX = m4.copy(mo_matrix);
   mo_matrixTASX = m4.translate(mo_matrixTASX, px, py, pz);
   mo_matrixTASX = m4.yRotate(mo_matrixTASX, degToRad(facing));
   mo_matrixTASX = m4.translate(mo_matrixTASX, -0.80, raggioRuotaA, -1.45);
   mo_matrixTASX = m4.yRotate(mo_matrixTASX, degToRad(sterzo));
   mo_matrixTASX = m4.xRotate(mo_matrixTASX, degToRad(mozzoA));
   gl.uniformMatrix4fv(_Mmatrix, false, mo_matrixTASX);
   var modelView = m4.multiply(view_matrix,mo_matrixTASX);
   gl.uniformMatrix4fv(_phongNormalMat, false, m4.transpose(m4.inverse(modelView)));
   gl.uniformMatrix4fv(_wPhongNormalMat, false, m4.transpose(m4.inverse(mo_matrixTASX)));

   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_bufferTASX);
   gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_position);

   gl.bindBuffer(gl.ARRAY_BUFFER, ka_bufferTASX);
   gl.vertexAttribPointer(_aKa, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKa);
   gl.bindBuffer(gl.ARRAY_BUFFER, kd_bufferTASX);
   gl.vertexAttribPointer(_aKd, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKd);
   gl.bindBuffer(gl.ARRAY_BUFFER, ks_bufferTASX);
   gl.vertexAttribPointer(_aKs, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKs);
   gl.bindBuffer(gl.ARRAY_BUFFER, ns_bufferTASX);
   gl.vertexAttribPointer(_ashininess, 1, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_ashininess);

   gl.bindBuffer(gl.ARRAY_BUFFER, normal_bufferTASX);
   gl.vertexAttribPointer(_vertNormal, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_vertNormal);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_bufferTASX);

   gl.uniform1i(_envMapMode, 0);
   gl.drawElements(gl.TRIANGLES, objIndTASX.length, gl.UNSIGNED_SHORT, 0);
   
   //ruotaADX
   mo_matrixTADX = m4.copy(mo_matrix);
   mo_matrixTADX = m4.translate(mo_matrixTADX, px, py, pz);
   mo_matrixTADX = m4.yRotate(mo_matrixTADX, degToRad(facing));
   mo_matrixTADX = m4.translate(mo_matrixTADX, 0.80, raggioRuotaA, -1.45);
   mo_matrixTADX = m4.yRotate(mo_matrixTADX, degToRad(sterzo));
   mo_matrixTADX = m4.xRotate(mo_matrixTADX, degToRad(mozzoA));
   // mo_matrixTADX = m4.scale(mo_matrixTADX, 0.08, raggioRuotaA, raggioRuotaA);
   gl.uniformMatrix4fv(_Mmatrix, false, mo_matrixTADX);
   var modelView = m4.multiply(view_matrix,mo_matrixTADX);
   gl.uniformMatrix4fv(_phongNormalMat, false, m4.transpose(m4.inverse(modelView)));
   gl.uniformMatrix4fv(_wPhongNormalMat, false, m4.transpose(m4.inverse(mo_matrixTADX)));

   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_bufferTADX);
   gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_position);

   gl.bindBuffer(gl.ARRAY_BUFFER, ka_bufferTADX);
   gl.vertexAttribPointer(_aKa, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKa);
   gl.bindBuffer(gl.ARRAY_BUFFER, kd_bufferTADX);
   gl.vertexAttribPointer(_aKd, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKd);
   gl.bindBuffer(gl.ARRAY_BUFFER, ks_bufferTADX);
   gl.vertexAttribPointer(_aKs, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKs);
   gl.bindBuffer(gl.ARRAY_BUFFER, ns_bufferTADX);
   gl.vertexAttribPointer(_ashininess, 1, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_ashininess);

   gl.bindBuffer(gl.ARRAY_BUFFER, normal_bufferTADX);
   gl.vertexAttribPointer(_vertNormal, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_vertNormal);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_bufferTADX);

   gl.drawElements(gl.TRIANGLES, objIndTADX.length, gl.UNSIGNED_SHORT, 0);

   //ruotaPSX
   mo_matrixTPSX = m4.copy(mo_matrix);
   mo_matrixTPSX = m4.translate(mo_matrixTPSX, px, py, pz);
   mo_matrixTPSX = m4.yRotate(mo_matrixTPSX, degToRad(facing));
   mo_matrixTPSX = m4.translate(mo_matrixTPSX, -0.80, +raggioRuotaA, +1.45);
   mo_matrixTPSX = m4.xRotate(mo_matrixTPSX, degToRad(mozzoP));
   // mo_matrix1 = m4.scale(mo_matrixTPSX, 0.1, raggioRuotaP, raggioRuotaP);
   gl.uniformMatrix4fv(_Mmatrix, false, mo_matrixTPSX);
   var modelView = m4.multiply(view_matrix,mo_matrixTPSX);
   gl.uniformMatrix4fv(_phongNormalMat, false, m4.transpose(m4.inverse(modelView)));
   gl.uniformMatrix4fv(_wPhongNormalMat, false, m4.transpose(m4.inverse(mo_matrixTPSX)));

   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_bufferTPSX);
   gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_position);

   gl.bindBuffer(gl.ARRAY_BUFFER, ka_bufferTPSX);
   gl.vertexAttribPointer(_aKa, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKa);
   gl.bindBuffer(gl.ARRAY_BUFFER, kd_bufferTPSX);
   gl.vertexAttribPointer(_aKd, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKd);
   gl.bindBuffer(gl.ARRAY_BUFFER, ks_bufferTPSX);
   gl.vertexAttribPointer(_aKs, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKs);
   gl.bindBuffer(gl.ARRAY_BUFFER, ns_bufferTPSX);
   gl.vertexAttribPointer(_ashininess, 1, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_ashininess);

   gl.bindBuffer(gl.ARRAY_BUFFER, normal_bufferTPSX);
   gl.vertexAttribPointer(_vertNormal, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_vertNormal);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_bufferTPSX);

   gl.drawElements(gl.TRIANGLES, objIndTPSX.length, gl.UNSIGNED_SHORT, 0);

   //ruotaPDX
   mo_matrixTPDX = m4.copy(mo_matrix);
   mo_matrixTPDX = m4.translate(mo_matrixTPDX, px, py, pz);
   mo_matrixTPDX = m4.yRotate(mo_matrixTPDX, degToRad(facing));
   mo_matrixTPDX = m4.translate(mo_matrixTPDX, +0.80, +raggioRuotaA, +1.45);
   mo_matrixTPDX = m4.xRotate(mo_matrixTPDX, degToRad(mozzoP));
   gl.uniformMatrix4fv(_Mmatrix, false, mo_matrixTPDX);
   var modelView = m4.multiply(view_matrix,mo_matrixTPDX);
   gl.uniformMatrix4fv(_phongNormalMat, false, m4.transpose(m4.inverse(modelView)));
   gl.uniformMatrix4fv(_wPhongNormalMat, false, m4.transpose(m4.inverse(mo_matrixTPDX)));

   gl.bindBuffer(gl.ARRAY_BUFFER, vertex_bufferTPDX);
   gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_position);

   gl.bindBuffer(gl.ARRAY_BUFFER, ka_bufferTPDX);
   gl.vertexAttribPointer(_aKa, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKa);
   gl.bindBuffer(gl.ARRAY_BUFFER, kd_bufferTPDX);
   gl.vertexAttribPointer(_aKd, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKd);
   gl.bindBuffer(gl.ARRAY_BUFFER, ks_bufferTPDX);
   gl.vertexAttribPointer(_aKs, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_aKs);
   gl.bindBuffer(gl.ARRAY_BUFFER, ns_bufferTPDX);
   gl.vertexAttribPointer(_ashininess, 1, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_ashininess);

   gl.bindBuffer(gl.ARRAY_BUFFER, normal_bufferTPDX);
   gl.vertexAttribPointer(_vertNormal, 3, gl.FLOAT, false, 0, 0);
   gl.enableVertexAttribArray(_vertNormal);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_bufferTPDX);

   gl.drawElements(gl.TRIANGLES, objIndTPDX.length, gl.UNSIGNED_SHORT, 0);
}


var objIndC=[], objIndTASX=[], objIndTADX=[], objIndTPSX=[], objIndTPDX=[];
function storeObjData(data, mtlData, part) {
   var nface, objVert = [];
   var nnorm, objNorm = [];
   var nsVert = [], kaVert = [], kdVert = [], ksVert = [], numVert;

   //"mesh" creato da mesh_utils
   mesh = ReadOBJ(data, mtlData, mesh);
   //mesh = LoadSubdivMesh(mesh); //riempie le strutture dati della mesh FE,VV,EV ecc.
   
   nvert = mesh.nvert;
   nnorm = mesh.nnorm;
   nface = mesh.nface;

   switch (part) {
      case 'chassis':
         //INDICI
         var k = 0;
         for (var i = 1; i <= nface; i++) {
            //mesh.face[i].n_v_e: numero vertici di quella faccia (devono essere facce triangolari)
            if (mesh.face[i].n_v_e == 3) {
               for (t = 0; t < 3; t++) {
                  vertIndex = mesh.face[i].vert[t] - 1; //es il primo vertice (vertIndex=0), -1 necessario perchè il formato obj conta partendo da 1 e non da 0
                  normVertIndex = mesh.face[i].norm[t] - 1;
                  numVert=vertIndex*3;
                  //salvataggio valori materiali per ogni vertice (es vertice uno: objVert=[x,y,z,x2,y2,z2......] kaVert=[r,g,b,r2,b2,g2........] 
                  //ns=[ns,ns2....])
                  if(mesh.face[i].material){
                     kaVert[numVert] = mesh.face[i].material.ka[0]; kdVert[numVert] = mesh.face[i].material.kd[0];ksVert[numVert] = mesh.face[i].material.ks[0];
                     kaVert[numVert+1] = mesh.face[i].material.ka[1];kdVert[numVert+1] = mesh.face[i].material.kd[1];ksVert[numVert+1] = mesh.face[i].material.ks[1];
                     kaVert[numVert+2] = mesh.face[i].material.ka[2];kdVert[numVert+2] = mesh.face[i].material.kd[2];ksVert[numVert+2] = mesh.face[i].material.ks[2];
                     nsVert[vertIndex]=mesh.face[i].material.ns;
                  }
                  //salvataggio valori delle normali per ogni vertice (es vertice uno: objVert=[x,y,z,x2,y2,z2......] objNorm=[xn,yn,zn,xn2,yn2,zn2........] 
                  //ns=[ns,ns2....])
                  objVert[numVert] = mesh.vert[vertIndex+1].x;
                  objVert[numVert+1] = mesh.vert[vertIndex+1].y;
                  objVert[numVert+2] = mesh.vert[vertIndex+1].z;
                  objNorm[numVert] = mesh.norm[normVertIndex + 1].x;
                  objNorm[numVert + 1] = mesh.norm[normVertIndex + 1].y;
                  objNorm[numVert + 2] = mesh.norm[normVertIndex + 1].z;

                  objIndC[k] = vertIndex;
                  k++;
               }
            }
         }

         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_bufferC);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(objVert), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ARRAY_BUFFER, ka_bufferC);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(kaVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, kd_bufferC);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(kdVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, ks_bufferC);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(ksVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, ns_bufferC);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(nsVert), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ARRAY_BUFFER, normal_bufferC);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(objNorm), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_bufferC);
         gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objIndC), gl.STATIC_DRAW);
         break;

      case 'tireASX':
         //INDICI
         var k = 0;
         for (var i = 1; i <= nface; i++) {
            if (mesh.face[i].n_v_e == 3) {
               for (t = 0; t < 3; t++) {
                  vertIndex = mesh.face[i].vert[t] - 1;
                  numVert=vertIndex*3;
                  normVertIndex = mesh.face[i].norm[t]-1;
                  
                  if(mesh.face[i].material){
                     kaVert[numVert] = mesh.face[i].material.ka[0]; kdVert[numVert] = mesh.face[i].material.kd[0];ksVert[numVert] = mesh.face[i].material.ks[0];
                     kaVert[numVert+1] = mesh.face[i].material.ka[1];kdVert[numVert+1] = mesh.face[i].material.kd[1];ksVert[numVert+1] = mesh.face[i].material.ks[1];
                     kaVert[numVert+2] = mesh.face[i].material.ka[2];kdVert[numVert+2] = mesh.face[i].material.kd[2];ksVert[numVert+2] = mesh.face[i].material.ks[2];
                     nsVert[vertIndex]=mesh.face[i].material.ns;
                  }

                  objVert[numVert] = mesh.vert[vertIndex+1].x;
                  objVert[numVert+1] = mesh.vert[vertIndex+1].y;
                  objVert[numVert+2] = mesh.vert[vertIndex+1].z;
                  objNorm[numVert] = mesh.norm[normVertIndex + 1].x;
                  objNorm[numVert + 1] = mesh.norm[normVertIndex + 1].y;
                  objNorm[numVert + 2] = mesh.norm[normVertIndex + 1].z;

                  objIndTASX[k] = vertIndex;
                  k++;
               }
            }
         }

         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_bufferTASX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(objVert), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ARRAY_BUFFER, ka_bufferTASX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(kaVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, kd_bufferTASX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(kdVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, ks_bufferTASX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(ksVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, ns_bufferTASX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(nsVert), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ARRAY_BUFFER, normal_bufferTASX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(objNorm), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_bufferTASX);
         gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objIndTASX), gl.STATIC_DRAW);
         break;

      case 'tireADX':
         //INDICI
         var k = 0;
         for (var i = 1; i <= nface; i++) {
            if (mesh.face[i].n_v_e == 3) {
               for (t = 0; t < 3; t++) {
                  vertIndex = mesh.face[i].vert[t] - 1; 
                  numVert=vertIndex*3;
                  normVertIndex = mesh.face[i].norm[t]-1;
                  
                  if(mesh.face[i].material){
                     kaVert[numVert] = mesh.face[i].material.ka[0]; kdVert[numVert] = mesh.face[i].material.kd[0];ksVert[numVert] = mesh.face[i].material.ks[0];
                     kaVert[numVert+1] = mesh.face[i].material.ka[1];kdVert[numVert+1] = mesh.face[i].material.kd[1];ksVert[numVert+1] = mesh.face[i].material.ks[1];
                     kaVert[numVert+2] = mesh.face[i].material.ka[2];kdVert[numVert+2] = mesh.face[i].material.kd[2];ksVert[numVert+2] = mesh.face[i].material.ks[2];
                     nsVert[vertIndex]=mesh.face[i].material.ns;
                  }

                  objVert[numVert] = mesh.vert[vertIndex+1].x;
                  objVert[numVert+1] = mesh.vert[vertIndex+1].y;
                  objVert[numVert+2] = mesh.vert[vertIndex+1].z;
                  objNorm[numVert] = mesh.norm[normVertIndex + 1].x;
                  objNorm[numVert + 1] = mesh.norm[normVertIndex + 1].y;
                  objNorm[numVert + 2] = mesh.norm[normVertIndex + 1].z;

                  objIndTADX[k] = vertIndex; 
                  k++;
               }
            }
         }

         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_bufferTADX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(objVert), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ARRAY_BUFFER, ka_bufferTADX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(kaVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, kd_bufferTADX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(kdVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, ks_bufferTADX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(ksVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, ns_bufferTADX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(nsVert), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ARRAY_BUFFER, normal_bufferTADX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(objNorm), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_bufferTADX);
         gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objIndTADX), gl.STATIC_DRAW);
         break;

      case 'tirePSX':
         //INDICI
         var k = 0;
         for (var i = 1; i <= nface; i++) {
            if (mesh.face[i].n_v_e == 3) {
               for (t = 0; t < 3; t++) {
                  vertIndex = mesh.face[i].vert[t] - 1; 
                  numVert=vertIndex*3;
                  normVertIndex = mesh.face[i].norm[t]-1;

                  if(mesh.face[i].material){
                     kaVert[numVert] = mesh.face[i].material.ka[0]; kdVert[numVert] = mesh.face[i].material.kd[0];ksVert[numVert] = mesh.face[i].material.ks[0];
                     kaVert[numVert+1] = mesh.face[i].material.ka[1];kdVert[numVert+1] = mesh.face[i].material.kd[1];ksVert[numVert+1] = mesh.face[i].material.ks[1];
                     kaVert[numVert+2] = mesh.face[i].material.ka[2];kdVert[numVert+2] = mesh.face[i].material.kd[2];ksVert[numVert+2] = mesh.face[i].material.ks[2];
                     nsVert[vertIndex]=mesh.face[i].material.ns;
                  }

                  objVert[numVert] = mesh.vert[vertIndex+1].x;
                  objVert[numVert+1] = mesh.vert[vertIndex+1].y;
                  objVert[numVert+2] = mesh.vert[vertIndex+1].z;
                  objNorm[numVert] = mesh.norm[normVertIndex + 1].x;
                  objNorm[numVert + 1] = mesh.norm[normVertIndex + 1].y;
                  objNorm[numVert + 2] = mesh.norm[normVertIndex + 1].z;

                  objIndTPSX[k] = vertIndex;
                  k++;
               }
            }
         }

         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_bufferTPSX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(objVert), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ARRAY_BUFFER, ka_bufferTPSX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(kaVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, kd_bufferTPSX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(kdVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, ks_bufferTPSX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(ksVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, ns_bufferTPSX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(nsVert), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ARRAY_BUFFER, normal_bufferTPSX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(objNorm), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_bufferTPSX);
         gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objIndTPSX), gl.STATIC_DRAW);
         break;

      case 'tirePDX':
         //INDICI
         var k = 0;
         for (var i = 1; i <= nface; i++) {
            if (mesh.face[i].n_v_e == 3) {
               for (t = 0; t < 3; t++) {
                  vertIndex = mesh.face[i].vert[t] - 1;
                  numVert=vertIndex*3;
                  normVertIndex = mesh.face[i].norm[t]-1;

                  if(mesh.face[i].material){
                     kaVert[numVert] = mesh.face[i].material.ka[0]; kdVert[numVert] = mesh.face[i].material.kd[0];ksVert[numVert] = mesh.face[i].material.ks[0];
                     kaVert[numVert+1] = mesh.face[i].material.ka[1];kdVert[numVert+1] = mesh.face[i].material.kd[1];ksVert[numVert+1] = mesh.face[i].material.ks[1];
                     kaVert[numVert+2] = mesh.face[i].material.ka[2];kdVert[numVert+2] = mesh.face[i].material.kd[2];ksVert[numVert+2] = mesh.face[i].material.ks[2];
                     nsVert[vertIndex]=mesh.face[i].material.ns;
                  }

                  objVert[numVert] = mesh.vert[vertIndex+1].x;
                  objVert[numVert+1] = mesh.vert[vertIndex+1].y;
                  objVert[numVert+2] = mesh.vert[vertIndex+1].z;
                  objNorm[numVert] = mesh.norm[normVertIndex + 1].x;
                  objNorm[numVert + 1] = mesh.norm[normVertIndex + 1].y;
                  objNorm[numVert + 2] = mesh.norm[normVertIndex + 1].z;

                  objIndTPDX[k] = vertIndex; 
                  k++;
               }
            }
         }

         gl.bindBuffer(gl.ARRAY_BUFFER, vertex_bufferTPDX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(objVert), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ARRAY_BUFFER, ka_bufferTPDX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(kaVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, kd_bufferTPDX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(kdVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, ks_bufferTPDX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(ksVert), gl.STATIC_DRAW);
         gl.bindBuffer(gl.ARRAY_BUFFER, ns_bufferTPDX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(nsVert), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ARRAY_BUFFER, normal_bufferTPDX);
         gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(objNorm), gl.STATIC_DRAW);

         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_bufferTPDX);
         gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(objIndTPDX), gl.STATIC_DRAW);
         break;

      default:
         console.error('storeObjData: invalid car part')
         break;
   }
}

function loadObjCar() {
   //loading chassis
   $.ajax({
      url: './resources/car/car.obj',
      success: function (objData) {
         $.ajax({
            url: './resources/car/car.mtl',
            success: function (mtlData) {
               storeObjData(objData, mtlData, 'chassis')
            }
         });
      }
   });

   //loading tireASX
   $.ajax({
      url: './resources/car/TireASX-mtl.obj',
      success: function (objData) {
         $.ajax({
            url: './resources/car/TireASX-mtl.mtl',
            success: function (mtlData) {
               storeObjData(objData, mtlData, 'tireASX')
            }
         });
      }
   });

   //loading tireADX
   $.ajax({
      url: './resources/car/TireADX-mtl.obj',
      success: function (objData) {
         $.ajax({
            url: './resources/car/TireADX-mtl.mtl',
            success: function (mtlData) {
               storeObjData(objData, mtlData, 'tireADX')
            }
         });
      }
   });

   //loading tirePSX
   $.ajax({
      url: './resources/car/TirePSX-mtl.obj',
      success: function (objData) {
         $.ajax({
            url: './resources/car/TirePSX-mtl.mtl',
            success: function (mtlData) {
               storeObjData(objData, mtlData, 'tirePSX')
            }
         });
      }
   });

   //loading tirePDX
   $.ajax({
      url: './resources/car/TirePDX-mtl.obj',
      success: function (objData) {
         $.ajax({
            url: './resources/car/TirePDX-mtl.mtl',
            success: function (mtlData) {
               storeObjData(objData, mtlData, 'tirePDX')
            }
         });
      }
   });
}