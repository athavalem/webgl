"use strict";

var canvas;
var gl;

var points = [];

var colors = [];
 var baseColors = [
        vec3(255.0, 0.0, 0.0),
        vec3(0.0, 255.0, 0.0),
        vec3(0.0, 0.0, 255.0)
       
    ];
var theta = 0;
var thetaLoc;
var NumTimesToSubdivide = 1;
var borderOnly = 'YES'
var rand = 'NO'
var red = 0;
var green = 0;
var blue = 0;
var program;

function changeBorderFill() {
    if (document.forms[0].radio1[0].checked == true) {
        borderOnly = 'YES'
    } else {

        borderOnly = 'NO'
    }
    generatePoints();
    render();

}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }



     document.getElementById("red").onchange = function() {
        red = event.srcElement.value;
        generatePoints();

        render();
    };
    
      document.getElementById("green").onchange = function() {
        green = event.srcElement.value;
        generatePoints();

        render();
    };
    
    document.getElementById("blue").onchange = function() {
        blue = event.srcElement.value;
        generatePoints();

        render();
    };

     document.getElementById("rand").onchange = function() {
         if( event.srcElement.checked ){
             rand = 'YES';
         }
         else{
             rand = 'NO';
         }
         
        generatePoints();

        render();
    };
    document.getElementById("subdivisions").onchange = function() {
        NumTimesToSubdivide = event.srcElement.value;
        generatePoints();

        render();
    };

    document.getElementById("rotation").onchange = function() {
        theta = event.srcElement.value;
        theta = (theta * Math.PI / 180) / 1;
        generatePoints();

        render();
    };

    //
    gl.viewport(0, 0, canvas.width , canvas.height );
    //  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    
//    
//    // Load the data into the GPU
//
//    var bufferId = gl.createBuffer();
//    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
//
//
//    // Associate out shader variables with our data buffer
//
//    var vPosition = gl.getAttribLocation(program, "vPosition");
//    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
//    gl.enableVertexAttribArray(vPosition);
    
    
  

    generatePoints();

    render();
};


function generatePoints() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    points = [];
    colors = [];
    var vertices = [
        vec2(-1 / 2, -1 / 2),
        vec2(0, 1 / 2),
        vec2(1 / 2, -1 / 2)
    ];
    divideTriangle(vertices[0], vertices[1], vertices[2],
        NumTimesToSubdivide);
    modifyPoints(points);
  //  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function modifyPoints(points) {



    for (var i = 0; i < points.length; ++i) {


        var d = Math.sqrt(points[i][0] * points[i][0] + points[i][1] * points[i][1])

        var x = points[i][0] * Math.cos(d * theta) - points[i][1] * Math.sin(d * theta);
        var y = points[i][0] * Math.sin(d * theta) + points[i][1] * Math.cos(d * theta);
        points[i] = [x, y];
    }
}

function triangle(a, b, c) {
    points.push(a, b, c);
//    colors.push( baseColors[0] );
//    colors.push( baseColors[1] );
//    colors.push( baseColors[2] );
    
    colors.push( colorGenerator() );
      colors.push( colorGenerator() );
      colors.push( colorGenerator() );
}

function colorGenerator(){
    if (rand == 'NO'){
     return vec3(parseInt(red)/255, parseInt(green)/255, parseInt(blue)/255);
    }
    else{
    return vec3(Math.round(Math.random() * 255)/255, Math.round(Math.random() * 255)/255, Math.round(Math.random() * 255)/255);
    }
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
        if (borderOnly == 'NO')
            divideTriangle(ab, bc, ac, count);
    }
}

function render() {
    ///
    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    ////
     var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);


    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    //////
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}