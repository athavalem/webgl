"use strict";

var gl;

var theta;

var canvas;

var program;

var points = [];

var aVertexPosition;
var textureCoordAttribute;
var vertexNormalAttribute;

var pMatrixU;
var mvMatrixU;
var nMatrix;
var sampler;
var ambientColor;
var lightDirection;
var directionalColor;

var mvMatrix = mat4.create();

var pMatrix = mat4.create();
var rotationMatrix = mat4.create();
var vertexPositionBuffer;
var vertexNormalBuffer;
var vertexTextureBuffer;
var vertexIndexBuffer;

var maxLatitute = 30;
var maxLongitude = 30;
var radius = 1;

var vertexPositionData = [];
var normalData = [];
var normalTextureCoordData = [];
var indexData = [];

var textureType = 'CUBE';
var mappingType = 'NORMAL';
var checkTexture;
var texSize = 256;

var checkerBoardImage;

var gifTexture;
var flowerTexture;
var gravelTexture;
var gifImage;
var flowerImage;
var gravelImage;

var zAxis = 5.0;
var xSpeed = 10;
var ySpeed = 10;


window.onload = function init() {

    setupControls();
    setupGL();
    setupBuffers();
    setupGIFTexture();
    setupFlowerTexture();
    setupGravelTexture();
    initCheckeredBoardTexture();
    draw();
}

function setupControls() {

    canvas = document.getElementById("gl-canvas");
    
    document.getElementById("zAxis").value = 5.0;
    document.getElementById("zAxis").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        zAxis = targ.value;
        draw();

    };

    document.getElementById("xSpeed").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        xSpeed = targ.value;
        draw();

    };

     document.getElementById("ySpeed").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        ySpeed = targ.value;
        draw();

    };
}

function changeTexture() {

    if (document.forms[0].radio1[0].checked == true) {
        textureType = 'CUBE'
    }

    if (document.forms[0].radio1[1].checked == true) {
        textureType = 'FLOWER'
    }

    if (document.forms[0].radio1[2].checked == true) {
        textureType = 'GRAVEL'
    }

    if (document.forms[0].radio1[3].checked == true) {
        textureType = 'GIF'
    }


   rotationMatrix = mat4.create();
     mat4.identity(rotationMatrix);
    draw();


}


function changeMappingMethod() {

    if (document.forms[1].radio1[0].checked == true) {
        mappingType = 'NORMAL'
    }

    if (document.forms[1].radio1[1].checked == true) {
        mappingType = 'PLANAR'
    }
  
    setupBuffers();
    draw();
}

function setupGL() {
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    aVertexPosition = gl.getAttribLocation(program, "vertexPosition");
    gl.enableVertexAttribArray(aVertexPosition);

    textureCoordAttribute = gl.getAttribLocation(program, "textureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute);

    vertexNormalAttribute = gl.getAttribLocation(program, "vertexNormal");
    gl.enableVertexAttribArray(vertexNormalAttribute);

    pMatrixU = gl.getUniformLocation(program, "pMatrix");
    mvMatrixU = gl.getUniformLocation(program, "mVMatrix");
    nMatrix = gl.getUniformLocation(program, "nMatrix");
    sampler = gl.getUniformLocation(program, "sampler");
    ambientColor = gl.getUniformLocation(program, "ambientColor");
    lightDirection = gl.getUniformLocation(program, "lightingDirection");
    directionalColor = gl.getUniformLocation(program, "directionalColor");
    mat4.identity(rotationMatrix);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);



}

function createCheckerBoardImage() {
    var image1 = new Array()
    for (var i = 0; i < texSize; i++) image1[i] = new Array();
    for (var i = 0; i < texSize; i++)
        for (var j = 0; j < texSize; j++)
            image1[i][j] = new Float32Array(4);
    for (var i = 0; i < texSize; i++)
        for (var j = 0; j < texSize; j++) {
            var c = (((i & 0x8) == 0) ^ ((j & 0x8) == 0));
            image1[i][j] = [c, c, c, 1];
        }

    checkerBoardImage = new Uint8Array(4 * texSize * texSize);

    for (var i = 0; i < texSize; i++)
        for (var j = 0; j < texSize; j++)
            for (var k = 0; k < 4; k++)
                checkerBoardImage[4 * texSize * i + 4 * j + k] = 255 * image1[i][j][k];

}

function initCheckeredBoardTexture() {
    createCheckerBoardImage();
    checkTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, checkTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, checkerBoardImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function configureGifTexture(texture, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function setupGIFTexture() {
    gifTexture = gl.createTexture();
    gifImage = new Image();
    gifImage.crossOrigin = "anonymous";
    //gifImage.src = "SA2011_black.gif";
    gifImage.src = "https://s3.amazonaws.com/webgl.mva/SA2011_black.gif";

    gifImage.onload = function() {
        configureGifTexture(gifTexture, gifImage)
    }

}

function setupFlowerTexture() {
    flowerTexture = gl.createTexture();
    flowerImage = new Image();
    flowerImage.crossOrigin = "anonymous";

    flowerImage.src = "https://s3.amazonaws.com/glowscript/textures/flower_texture.jpg";

    flowerImage.onload = function() {
        configureGifTexture(flowerTexture, flowerImage)
    }

}


function setupGravelTexture() {
    gravelTexture = gl.createTexture();
    gravelImage = new Image();
    gravelImage.crossOrigin = "anonymous";

    gravelImage.src = "https://s3.amazonaws.com/glowscript/textures/gravel_texture.jpg";


    gravelImage.onload = function() {
        configureGifTexture(gravelTexture, gravelImage)
    }

  
}



function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


// The logic for setupBuffers has been adopted from learningwebgl.com lesson 11.
// I concluded that this logic is superior to what I have used for assignment 3 and 4. 
// The logic for assignment 3 and 4 is also availble at same guthub url. I could have used logic from assignment3/4 
// for this assginment also. I decided to use the logc given below and experiment with the new gl library which is widely used.
function setupBuffers() {

    maxLatitute = 40;
    maxLongitude = 40;
    radius = 1;
    vertexPositionData = [];
    normalData = [];
    normalTextureCoordData = [];
    indexData = [];

    for (var latIndex = 0; latIndex <= maxLatitute; latIndex++) {
        var theta = latIndex * Math.PI / maxLatitute;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longIndex = 0; longIndex <= maxLongitude; longIndex++) {
            var phi = longIndex * 2 * Math.PI / maxLongitude;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longIndex / maxLongitude);
            var v = 1 - (latIndex / maxLatitute);

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            if (mappingType == 'NORMAL'){
            normalTextureCoordData.push(u);
            normalTextureCoordData.push(v);
            }
            else{
             normalTextureCoordData.push(x);
             normalTextureCoordData.push(y);
            }
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }


    for (var latIndex = 0; latIndex < maxLatitute; latIndex++) {
        for (var longIndex = 0; longIndex < maxLongitude; longIndex++) {
            var first = (latIndex * (maxLongitude + 1)) + longIndex;
            var second = first + maxLongitude + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    vertexNormalBuffer.itemSize = 3;
    vertexNormalBuffer.numItems = normalData.length / 3;

    vertexTextureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalTextureCoordData), gl.STATIC_DRAW);
    vertexTextureBuffer.itemSize = 2;
    vertexTextureBuffer.numItems = normalTextureCoordData.length / 2;

    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numItems = vertexPositionData.length / 3;

    vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    vertexIndexBuffer.itemSize = 1;
    vertexIndexBuffer.numItems = indexData.length;
}



function drawSphere() {

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    gl.uniform3f(ambientColor, 1, 1, 1);
    var lightingDirection = [1, 1, 1];
    var adjustedLD = vec3.create();
    vec3.normalize(lightingDirection, adjustedLD);
    vec3.scale(adjustedLD, -1);
    gl.uniform3fv(lightDirection, adjustedLD);

    gl.uniform3f(directionalColor, 0.3, 0.3, 0.3);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [0, 0, -zAxis]);

    var newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
    
    mat4.rotate(newRotationMatrix, degToRad(-xSpeed / 100), [1, 0, 0]);

    mat4.rotate(newRotationMatrix, degToRad(-ySpeed / 100), [0, 1, 0]);

    mat4.multiply(newRotationMatrix, rotationMatrix, rotationMatrix);


    /////////////

    mat4.multiply(mvMatrix, rotationMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, checkTexture);
    if (textureType == 'GIF') {
        gl.bindTexture(gl.TEXTURE_2D, gifTexture);
    }
    
    if (textureType == 'FLOWER') {
        gl.bindTexture(gl.TEXTURE_2D, flowerTexture);
    }
    
    if (textureType == 'GRAVEL') {
        gl.bindTexture(gl.TEXTURE_2D, gravelTexture);
    }
    // gl.bindTexture(gl.TEXTURE_2D, checkTexture);
    gl.uniform1i(sampler, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(aVertexPosition, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, vertexTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.vertexAttribPointer(vertexNormalAttribute, vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);

    gl.uniformMatrix4fv(pMatrixU, false, pMatrix);
    gl.uniformMatrix4fv(mvMatrixU, false, mvMatrix);

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(nMatrix, false, normalMatrix);
    gl.drawElements(gl.TRIANGLES, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


function draw() {
    requestAnimFrame(draw);
    drawSphere();
}


