//moltiplicazione in coordinate omogenee matrice - vettore colonna
function matrixVectorMultiply(matrix,vector){
   var resVector = [], temp=0;
   for(i=0;i<matrix.length;i++){
      for(j=0;j<matrix[i].length;j++){
         if(matrix[i].length!=vector.length) return -1;
         temp+= matrix[i][j]*vector[j];
      }
      resVector[i]=temp;
      temp=0;
   }
   return resVector;
}

//converte matrice m4 in matrice standard javascript
function convertMatrix(matrix){
   var j=0,k=0, resMatrix=[[1,0,0,0],
                           [0,1,0,0],
                           [0,0,1,0],
                           [0,0,0,1]];
   for(i=0;i<matrix.length;i++){
       resMatrix[j][k]=matrix[i];
       if(j==3){
           k++;
           j=0;
       }
       else j++;
   }
   return resMatrix;
}

//max escluso
function getRandomArbitrary(min, max) {
   return Math.random() * (max - min) + min;
 }

 //estremi inclusi
 function getRandomInt(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min + 1)) + min; //Il max è incluso e il min è incluso 
 }

 function degToRad(d) {
   return d * Math.PI / 180;
}

function radToDeg(d) {
   return d * 180 / Math.PI;
}

function isPowerOf2(value) {
   return (value & (value - 1)) === 0;
}