"use strict";

var canvas;
var gl;


var maxNumVertices = 500;
var index = 0;
var first = true;
var down = false;

var points = [];
var matV = [];
var matC = [];
var matW = []
var t;


var cBuffer;
var vBuffer;

var red = 0;
var green = 0;
var blue = 0;
var width = 1;



window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    document.getElementById("red").value = 0;
    document.getElementById("blue").value = 0;
    document.getElementById("green").value = 0;
    document.getElementById("width").value = 1;
    gl.viewport(0, 0, canvas.width, canvas.height);

    document.getElementById("width").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        width = targ.value;
        //  render();
    };

    document.getElementById("red").onchange = function(event) {

        var targ;
        if (event.target) targ = event.target;
        else if (event.srcElement) targ = event.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug 
            targ = targ.parentNode;
        red = targ.value;
        //  render();
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




    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    canvas.addEventListener("mousedown", function(event) {
        var rect = canvas.getBoundingClientRect();
        down = true;
        first = true;
        points = [];
    });

    canvas.addEventListener("mouseup", function(event) {
        down = false;
        matV.push(points);

        var floats = setColor(points);
        matC.push(floats);
        matW.push(width);
        render();
    });

    function setColor(points) {
        var rval = parseInt(red) / 255;
        var gval = parseInt(green) / 255;
        var bval = parseInt(blue) / 255;
        var floats = new Float32Array(points.length * 4);
        var j = 0;
        while (j < floats.length) {

            floats[j++] = rval;
            floats[j++] = gval;
            floats[j++] = bval;
            floats[j++] = 1.0;


        }

        return floats;
    }

    canvas.addEventListener("mousemove", function(event) {
        if (!down)
            return;

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        if (first) {
            first = false;
        }

        var rect = this.getBoundingClientRect();

        t = vec2(2 * (event.clientX - rect.left) / canvas.width - 1,
            2 * (canvas.height - (event.clientY - rect.top)) / canvas.height - 1);

        points.push(t);
    });

    document.getElementById("clear").onclick = function(event) {

        matV = [];
        matC = [];
        matW = [];
       render();
    };

}




function render() {



    window.requestAnimFrame(render, canvas);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (var i = 0; i < matV.length; i++) {
        var pt = matV[i];

        var cl = matC[i];
        var w = matW[i];

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pt), gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, flatten(cl), gl.STATIC_DRAW);
        gl.lineWidth(w);
        gl.drawArrays(gl.LINE_STRIP, 0, pt.length);
    }


}