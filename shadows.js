function shadowsInit(){
    //enabling depth texture extenstion for shadows (shadow buffer)
    const shadowExt = gl.getExtension('WEBGL_depth_texture');
    if (!shadowExt) {
        return alert('need WEBGL_depth_texture extension for shadows!');
    }
    
    //creating texture and framebuffer and attaching the texture to the framebuffer as a DEPTH_ATTACHMENT
    gl.activeTexture(gl.TEXTURE3);//0,1,2 already in use
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    //void texImage2D(enum target, int level, enum internalformat, long width, long height, int border, enum format, enum type, Object pixels)
    gl.texImage2D(
        gl.TEXTURE_2D,      // target
        0,                  // mip level
        gl.DEPTH_COMPONENT, // internal format
        depthTextureSize,   // width
        depthTextureSize,   // height
        0,                  // border
        gl.DEPTH_COMPONENT, // format
        gl.UNSIGNED_INT,    // type
        null);              // data
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
     
    //creating frame buffer
    
    // attaching depthtexture to the frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,       // target
        gl.DEPTH_ATTACHMENT,  // attachment point
        gl.TEXTURE_2D,        // texture target
        depthTexture,         // texture
        0);                   // mip level    
    
    // we also need to create a color texture and attach it as a color attachment 
    // even though we won't actually use it.
    // create a color texture of the same size as the depth texture
    const unusedTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        depthTextureSize,
        depthTextureSize,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    // attach it to the framebuffer
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,        // target
        gl.COLOR_ATTACHMENT0,  // attachment point
        gl.TEXTURE_2D,         // texture target
        unusedTexture,         // texture
        0);                    // mip level

    //free the framebuffer (otherwise rendering is blocked)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function drawScene(projectionMatrix, viewMatrix, textureMatrix, programInfo){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//resetta il depth e color buffer
    // Clear the 2D canvas
    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    gl.useProgram(programInfo.program);
    webglUtils.setUniforms(programInfo, {
        u_view: viewMatrix,
        u_projection: projectionMatrix,
        u_textureMatrix: textureMatrix,
        u_projectedTexture: depthTexture,
        // U_dirLightState: dirLightState
      });
    
    
    //set model matrix to I4
    mo_matrix = m4.identity();
    // gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);

    updateCarLights(px*carScaling[0],py*carScaling[1],pz*carScaling[2]);

    drawFloor(); // disegna il suolo
    //disegna mesh ambiente
    renderEnv();
    renderObjCar(carScaling);
    
}

//To use the depth texture we need to able to render the scene more than once 
//with different shaders. Once with a simple shader just to render to the 
//depth texture and then again with our current shader that projects a texture.
function renderShadows(){
    //first: render the scene from the POV of the light
    // gl.enable(gl.CULL_FACE);
    // gl.enable(gl.DEPTH_TEST);

    // first draw from the POV of the light (sun)
    var lightWorldMatrix = m4.inverse(m4.lookAt(
        [directionalLight[0], directionalLight[1], directionalLight[2]], //position
        [directionalLight[0], directionalLight[1], directionalLight[2]], //target (for directional lights i think target=position)
        up // up
    ));
    var lightProjectionMatrix  = m4.perspective(degToRad(fov), aspect, zmin, zmax);

    // draw to the depth texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    drawScene(lightProjectionMatrix, lightWorldMatrix, m4.identity(), shaderColorProgramInfo)

    // now draw scene to the canvas projecting the depth texture into the scene
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // let textureMatrix = m4.identity();
    // textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
    // textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
    // textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);

    // textureMatrix = m4.multiply(textureMatrix, lightWorldMatrix);
    // // Compute the projection matrix
    // proj_matrix = m4.perspective(degToRad(fov), aspect, zmin, zmax);
    // // Compute the camera's matrix using look at.
    // view_matrix = m4.inverse(m4.lookAt(cameras[cameraNum], targets[cameraNum], up));
    // drawScene(proj_matrix, view_matrix, textureMatrix, shaderShadowProgramInfo);
}