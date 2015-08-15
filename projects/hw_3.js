"use strict";

var gl;

var cBuffer;
var vBuffer;

var red = 0;
var green = 0;
var blue = 0;
var width = 1;


var u_xformMatrix;

var u_rformMatrix;

var matC = [];

var xformMatrix = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.5, 1.0
]);

var rotateMatrix = new Float32Array([
    0, 0, 0.0, 0.0,
    0, 0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 1.0
]);

var canvas;

var program;
var cyls = [];
var spheres = [];
var cones = [];
var shapeType = 'CYLINDER';
var rotation = 0.0;
var radius = 0.5;

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

}



function setupControls() {

    canvas = document.getElementById("gl-canvas");

    document.getElementById("red").value = 0;
    document.getElementById("blue").value = 0;
    document.getElementById("green").value = 0;
    document.getElementById("rotation").value = 0;
    document.getElementById("radius").value = 0.5;

    document.getElementById("clear").onclick = function(event) {

        cyls = [];
        cones = [];
        spheres = [];
        render();
    };

    document.getElementById("rotation").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        rotation = targ.value;

    };

    document.getElementById("radius").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        radius = targ.value;

    };

    document.getElementById("red").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        red = targ.value;

    };

    document.getElementById("green").onchange = function(event) {
        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        green = targ.value;
        // render();
    };

    document.getElementById("blue").onchange = function(event) {
        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        blue = targ.value;
        // render();
    };



}

function setupGL() {
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);


    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    u_xformMatrix = gl.getUniformLocation(program, 'u_xformMatrix');

    u_rformMatrix = gl.getUniformLocation(program, 'u_rformMatrix');


    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

}

window.onload = function init() {

    setupControls();
    setupGL();

    radius = 0.5;
    rotation = 0.0;
    canvas.addEventListener("click", function(event) {
        var rect = canvas.getBoundingClientRect();

        if (shapeType == 'CYLINDER') {
            var c1 = new cylinder();
            c1.rotation = Math.PI * parseInt(rotation) / 180.0;
            c1.radius = radius;
            c1.top = c1.calculatePoints(-radius);
            c1.bottom = c1.calculatePoints(radius);
            c1.lines = c1.sides();
            c1.red = red;
            c1.green = green;
            c1.blue = blue;
            c1.offSetX = 2 * (event.clientX - rect.left) / canvas.width - 1;
            c1.offSetY = 2 * (canvas.height - (event.clientY - rect.top)) / canvas.height - 1;

            cyls.push(c1);

            render();
        }

        if (shapeType == 'CONE') {
            var c1 = new cone();
            c1.rotation = Math.PI * parseInt(rotation) / 180.0;
            c1.radius = radius;

            c1.bottom = c1.calculatePoints(radius);
            c1.lines = c1.sides();
            c1.red = red;
            c1.green = green;
            c1.blue = blue;
            c1.offSetX = 2 * (event.clientX - rect.left) / canvas.width - 1;
            c1.offSetY = 2 * (canvas.height - (event.clientY - rect.top)) / canvas.height - 1;

            cones.push(c1);

            render();
        }


        if (shapeType == 'SPHERE') {
            var c1 = new sphere();
            
            c1.radius = radius;

            c1.points = c1.calculatePoints();
            
            c1.red = red;
            c1.green = green;
            c1.blue = blue;
            c1.offSetX = 2 * (event.clientX - rect.left) / canvas.width - 1;
            c1.offSetY = 2 * (canvas.height - (event.clientY - rect.top)) / canvas.height - 1;

            spheres.push(c1);

            render();
        }


        
    });

}




function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    var cylLength = cyls.length;
    var coneLength = cones.length;
    var sphereLength = spheres.length;
    var cylCntr;
    var coneCntr;
    var sphereCntr;

    for (cylCntr = 0; cylCntr < cylLength; cylCntr++) {

        cyls[cylCntr].render();
    }

    for (coneCntr = 0; coneCntr < coneLength; coneCntr++) {

        cones[coneCntr].render();
    }
    
    for (sphereCntr = 0; sphereCntr < sphereLength; sphereCntr++) {

        spheres[sphereCntr].render();
    }

}