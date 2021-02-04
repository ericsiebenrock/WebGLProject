var skyboxProgramInfo;
var quadBufferInfo;
var skyBoxTex, faceInfos;
var _skyboxTextureLocation, _skyboxMatrixLocation;

function renderSkyBox() {
    var viewDirectionMatrix = m4.copy(view_matrix);
    //rimuovo D (distanza/posizione camera) ovvero azzero ultima colonna della view matrix (matrice di trasf.
    //da coordinate mondo a coordinate osservatore) in quanto serve solo la direzione di vista
    //questo evita distorsioni della skybox texture in quanto è come se la camera fosse sempre fissa al centro
    //della skybox
    viewDirectionMatrix[12] = 0;
    viewDirectionMatrix[13] = 0;
    viewDirectionMatrix[14] = 0;

    var viewDirectionProjectionMatrix = m4.multiply(proj_matrix, viewDirectionMatrix);
    //si inverte la matrice poichè non si vuole proiettare il cubo nella scena ma lo scopo e' ottenere
    //i pixel del cubemap da renderizzare a seconda della direzione di vista della camera
    var viewDirectionProjectionInverseMatrix = m4.inverse(viewDirectionProjectionMatrix);

    gl.useProgram(skyboxProgramInfo.program);
    
    //imposta i buffer e fa il bind gli attributi (attenzione ai nomi degli attributi negli shader)
    webglUtils.setBuffersAndAttributes(gl, skyboxProgramInfo, quadBufferInfo);

    webglUtils.setUniforms(skyboxProgramInfo, {
        u_viewDirectionProjectionInverse: viewDirectionProjectionInverseMatrix,
        u_skybox: skyBoxTex,
    });

    //in questo caso esegue la drawElements (dato che sono stati specificati anche gli indici)
    //usando triangoli come primitive di disegno
    webglUtils.drawBufferInfo(gl, quadBufferInfo);

    gl.useProgram(shaderprogram);
}

function initSkyBox(){
    skyboxProgramInfo = webglUtils.createProgramInfo(gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);
    //questa funzione restituisce una funzione che crea le strutture dati position, normal, texcoord e indices
    //le cooridnate sono in spazio del piano di proiezione, quindi bastano la x e la y (che spaziano nell'intervallo [-1,1]
    //per coprire tutta la viewport, quindi alla fine la scena sarà interamente contenuta nel cubo)
    //(la z sara' impostata sempre a 1 in modo che la skybox non copra alcun oggetto di scena con il depth-test)
    quadBufferInfo = primitives.createXYQuadBufferInfo(gl);
    skyBoxTex = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyBoxTex);
   
    faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            url: 'resources/images/skybox/horizon-flipped.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: 'resources/images/skybox/horizon-flipped.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: 'resources/images/skybox/horizon-flipped.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: 'resources/images/skybox/horizon.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: 'resources/images/skybox/horizon.png',
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: 'resources/images/skybox/horizon.png',
        },
    ];

    faceInfos.forEach((faceInfo) => {
        const { target, url } = faceInfo;
    
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 2048;
        const height = 2048;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
    
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
    
        var sbImage = new Image();
        sbImage.src = url;
        sbImage.addEventListener('load', function () {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyBoxTex);
            gl.texImage2D(target, level, internalFormat, format, type, sbImage);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        });
    });
}

