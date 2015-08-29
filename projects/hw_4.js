"use strict";

var gl;


var vBuffer;
var nBuffer;

var red = 255 * 0.2;
var green = 255 * 0.2;
var blue = 255 * 0.2;
var width = 1;


var u_xformMatrix;
var xformMatrix = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.5, 1.0
]);

var canvas;

var program;

var shapeType = 'CYLINDER';
var lightType = 'AMBIENT';


var diffuseLightSwitch = 'ON';

var speclarLightSwitch = 'ON';


var radius = 1.0;

var pointsArray = [];
var normalsArray = [];

var near = -10;
var far = 10;

var theta = 0.0;
var phi = 0.0;

var xSpec = 1;
var ySpec = 1;
var zSpec = 1;

var xDif = 0.5;
var yDif = 0.5;
var zDif = 0.5;

var xLoc = 0.0;
var yLoc = 0.0;
var zLoc = 0.0;

var left = -3.0;
var right = 3.0;
var ytop = 3.0;
var bottom = -3.0;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightPosition1 = vec4(0.5, 0.5, 0.5, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 0.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialShininess = 10.0;

var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

function setupGL() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    nBuffer = gl.createBuffer();
    vBuffer = gl.createBuffer();

}


function setupShape() {

    pointsArray = [];
    normalsArray = [];
    if (shapeType == 'CYLINDER') {
        cylinder();
    }

    if (shapeType == 'CONE') {
        cone();
    }

    if (shapeType == 'SPHERE') {
        sphere();
    }

     u_xformMatrix = gl.getUniformLocation(program, 'u_xformMatrix');
    xformMatrix[12] = xLoc;
    xformMatrix[13] = yLoc;
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);


    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    gl.uniform4fv(gl.getUniformLocation(program,
        "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition"), flatten(lightPosition));
    gl.uniform4fv(gl.getUniformLocation(program,
        "lightPosition1"), flatten(lightPosition1));
    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);

    if (speclarLightSwitch == 'ON')
        gl.uniform1f(gl.getUniformLocation(program,
            "useSpecular"), 1.0);
    else
        gl.uniform1f(gl.getUniformLocation(program,
            "useSpecular"), 0.0);

    if (diffuseLightSwitch == 'ON')
        gl.uniform1f(gl.getUniformLocation(program,
            "useDiffuse"), 1.0);
    else
        gl.uniform1f(gl.getUniformLocation(program,
            "useDiffuse"), 0.0);

    render();
}

function changeShape() {
    if (document.forms[0].radio1[0].checked == true) {
        shapeType = 'CYLINDER'
    }

    if (document.forms[0].radio1[1].checked == true) {
        shapeType = 'CONE'
    }

    if (document.forms[0].radio1[2].checked == true) {
        shapeType = 'SPHERE'
    }
    setupShape();
}

function changeLight() {
    if (document.forms[1].radio2[0].checked == true) {
        lightType = 'AMBIENT'
    }

    if (document.forms[1].radio2[1].checked == true) {
        lightType = 'DIFFUSE'
    }

    if (document.forms[1].radio2[2].checked == true) {
        lightType = 'SPECULAR'
    }
    setupColors();

}

function checkDiffuseSwitch() {
    if (document.forms[3].radio4[0].checked == true) {
        diffuseLightSwitch = 'ON'
    }

    if (document.forms[3].radio4[1].checked == true) {
        diffuseLightSwitch = 'OFF'
    }


    setUpDiffuseLightLocation();

}


function setUpDiffuseLightLocation() {

    var x = parseFloat(xDif);
    var y = parseFloat(yDif);
    var z = parseFloat(zDif);
    lightPosition1 = vec4(x, y, z, 0.0);



    setupShape();

}

function checkSpecularSwitch() {
    if (document.forms[2].radio3[0].checked == true) {
        speclarLightSwitch = 'ON'
    }

    if (document.forms[2].radio3[1].checked == true) {
        speclarLightSwitch = 'OFF'
    }

    setUpSpecularLightLocation();
}

function setUpSpecularLightLocation() {

    var x = parseFloat(xSpec);
    var y = parseFloat(ySpec);
    var z = parseFloat(zSpec);
    lightPosition = vec4(x, y, z, 0.0);

    setupShape();

}

function setupColors() {

    var rval = parseInt(red) / 255;
    var gval = parseInt(green) / 255;
    var bval = parseInt(blue) / 255;
    var colorVec4 = vec4(rval, gval, bval, 1.0);

    if (lightType == 'AMBIENT') {
        lightAmbient = colorVec4;

    }

    if (lightType == 'DIFFUSE') {
        lightDiffuse = colorVec4;
    }

    if (lightType == 'SPECULAR') {
        lightSpecular = colorVec4;
    }

    setupShape();


}

function setupControls() {

    canvas = document.getElementById("gl-canvas");

    document.getElementById("red").value = 255 * 0.2;
    document.getElementById("blue").value = 255 * 0.2;
    document.getElementById("green").value = 255 * 0.2;

    red = 255 * 0.2;
    blue = 255 * 0.2;
    green = 255 * 0.2;
    xSpec = 1.0;
    ySpec = 1.0;
    zSpec = 1.0;

    xDif = 0.5;
    yDif = 0.5;
    zDif = 0.5;
    document.getElementById("radius").value = 1.0;
    document.getElementById("theta").value = 0.0;
    document.getElementById("phi").value = 0.0;

    document.getElementById("clear").onclick = function(event) {
        pointsArray = [];
        normalsArray = [];
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };


    document.getElementById("radius").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        radius = targ.value;
        setupShape();

    };


    document.getElementById("theta").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        theta = targ.value;
        setupShape();

    };


    document.getElementById("phi").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        phi = targ.value;
        setupShape();

    };


    document.getElementById("red").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        red = targ.value;
        setupColors();


    };

    document.getElementById("green").onchange = function(event) {
        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        green = targ.value;
        setupColors();
    };

    document.getElementById("blue").onchange = function(event) {
        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        blue = targ.value;
        setupColors();
    };

    document.getElementById("xSpec").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        xSpec = targ.value;
        setUpSpecularLightLocation();


    };

    document.getElementById("ySpec").onchange = function(event) {
        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        ySpec = targ.value;
        setUpSpecularLightLocation();
    };

    document.getElementById("zSpec").onchange = function(event) {
        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        zSpec = targ.value;
        setUpSpecularLightLocation();
    };

    document.getElementById("xDif").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        xDif = targ.value;
        setUpDiffuseLightLocation();


    };

    document.getElementById("yDif").onchange = function(event) {
        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        yDif = targ.value;
        setUpDiffuseLightLocation();
    };

    document.getElementById("zDif").onchange = function(event) {
        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        zDif = targ.value;
        setUpDiffuseLightLocation();
    };

    document.getElementById("xLoc").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        xLoc = targ.value;
        setupShape();


    };

    document.getElementById("yLoc").onchange = function(event) {
        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        yLoc = targ.value;
        setupShape();

    };

    document.getElementById("zLoc").onchange = function(event) {
        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        zLoc = targ.value;
        setupShape();

    };


}



window.onload = function init() {

    setupControls();
    setupGL();
    setupShape();


    radius = 1.0;



}

function sphere() {

    var radians;

    var angle;
    for (angle = 0; angle < 360; angle = angle + 2.0) {
        radians = Math.PI * angle / 180.0;
        pointsArray.push([(radius) * Math.cos(radians), (radius) * Math.sin(radians), 0.0, 1.0]);
        normalsArray.push([(radius) * Math.cos(radians), (radius) * Math.sin(radians), 1.0, 0.0]);
        pointsArray.push([0.0, 0.0, 0.0, 1.0]);
        normalsArray.push([0.0, 0.0, 1.0, 0.0]);
        radians = Math.PI * (angle + 1) / 180.0;
        pointsArray.push([(radius) * Math.cos(radians), (radius) * Math.sin(radians), 0.0, 1.0]);
        normalsArray.push([(radius) * Math.cos(radians), (radius) * Math.sin(radians), 1.0, 0.0]);

    }
    pointsArray.push([0.0, 0.0, 0.0, 1.0]);
    normalsArray.push([0.0, 0.0, 1.0, 0.0]);
    pointsArray.push([radius, 0.0, 0.0, 1.0]);
    normalsArray.push([radius, 0.0, 1.0, 0.0]);

}


function cylinder() {

    var radians;
    var r = radius;
    var l = r;
    var x = r;
    var y;
    var z;

    x = r;

    while (x > -r) {

        y = Math.sqrt(1.0 - (x * x) / (r * r));
        pointsArray.push([-x, y, 0.0, 1.0]);
        normalsArray.push([-x, y, 1.0, 0.0]);
        pointsArray.push([-x, y - l, 0.0, 1.0]);
        normalsArray.push([-x, y - l, 1.0, 0.0]);
        x = x - 0.005;

    }

    x = -r;
    while (x < r) {

        y = -Math.sqrt(1.0 - (x * x) / (r * r));
        pointsArray.push([-x, y, 0.0, 1.0]);
        normalsArray.push([-x, y, 1.0, 0.0]);
        pointsArray.push([-x, y - l, 0.0, 1.0]);
        normalsArray.push([-x, y - l, 1.0, 0.0]);
        x = x + 0.005;

    }

}


function cone() {

    var cntr = 0;
    var r = radius;
    var l =  r;
    var x = r;
    var y;

    //    while (x > -r) {
    //
    //        y = 0.5 * Math.sqrt(1.0 - (x * x) / (r * r));
    //        pointsArray.push([x, y, 0.0, 1.0]);
    //        normalsArray.push([x, y, 1.0, 0.0]);
    //        pointsArray.push([0, l, 0.0, 1.0]);
    //        normalsArray.push([0, l, 1.0, 0.0]);
    //        x = x - 0.005;
    //        y = 0.5 * Math.sqrt(1.0 - (x * x) / (r * r));
    //        pointsArray.push([x, y, 0.0, 1.0]);
    //        normalsArray.push([x, y, 1.0, 0.0]);
    //        x = x - 0.005;
    //
    //    }

    x = -r;
    while (x < r) {

        y = -0.5 * Math.sqrt(1.0 - (x * x) / (r * r)) -r;
        pointsArray.push([x, y, 0.0, 1.0]);
        normalsArray.push([x, y, 1.0, 0.0]);
        pointsArray.push([0, l, 0.0, 1.0]);
        normalsArray.push([0, l, 1.0, 0.0]);
        x = x + 0.005;
        y = -0.5 * Math.sqrt(1.0 - (x * x) / (r * r)) -r ;
        pointsArray.push([x, y, 0.0, 1.0]);
        normalsArray.push([x, y, 1.0, 0.0]);
        x = x + 0.005;

    }

}

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));

    // eye = vec3(0.0, 0.0, 0.0);
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));


    //      gl.drawArrays(gl.TRIANGLE_FAN, 0, pointsArray.length);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pointsArray.length);

    window.requestAnimFrame(render);


}