"use strict";

var canvas;
var gl;

var points = [];

var theta = 0;
var thetaLoc;
var NumTimesToSubdivide = 5;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    document.getElementById("subdivisions").onchange = function() {
        NumTimesToSubdivide = event.srcElement.value;
        generatePoints();

        render();
    };
    
     document.getElementById("rotation").onchange = function() {
        theta = event.srcElement.value;
         theta = theta * Math.PI /20;
        generatePoints();

        render();
    };

    //
    gl.viewport(0, 0, canvas.width / 2, canvas.height / 2);
    //  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);


    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    generatePoints();

    render();
};


function generatePoints() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    points = [];
    var vertices = [
        vec2(-1/2, -1/2),
        vec2(0, 1/2),
        vec2(1/2, -1/2)
    ];
    divideTriangle(vertices[0], vertices[1], vertices[2],
        NumTimesToSubdivide);
    modifyPoints(points);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function modifyPoints(points) {



    for (var i = 0; i < points.length; ++i) {

        
        var d = Math.sqrt(points[i][0] * points[i][0] + points[i][1] * points[i][1])

        var x = points[i][0] * Math.cos(d * theta) - points[i][1] * Math.sin(d * theta);
        var y = points[i][0] * Math.sin(d * theta) + points[i][1] * Math.cos(d * theta);
        points[i] = [x,y];
    }
}

function triangle(a, b, c) {
    points.push(a, b, c);
}

function divideTriangle(a, b, c, count) {

    // check for end of recursion

    if (count === 0) {
        triangle(a, b, c);
    } else {

        //bisect the sides

        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        // three new triangles

        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
        divideTriangle(ab, bc, ac, count);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}