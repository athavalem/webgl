function cone() {
    
    this.bottom = [];
    this.lines = [];
    var offSetX;
    var offSetY;
    var rotation;
    var radius;
    var red;
    var green;
    var blue;
    this.sides = function() {
        var sd = [];
        var l;
        for (l = 0; l < this.bottom.length; l = l + 40) {
            sd.push([0,0]);
            sd.push(this.bottom[l]);
        }
        return sd;
    }

    this.setColor = function setColor(size) {
        var floats = [];
        var rval = parseInt(this.red) / 255;
        var gval = parseInt(this.green) / 255;
        var bval = parseInt(this.blue) / 255;
        var floats = new Float32Array(size * 4);
        var j = 0;
        while (j < floats.length) {

            floats[j++] = rval;
            floats[j++] = gval;
            floats[j++] = bval;
            floats[j++] = 1.0;


        }

        return floats;
    }

    this.calculatePoints = function calculatePoints(l) {

    var points = [];
    var pt = [];
    points = [];
    pt = [];
    var cntr = 0;
    var r = this.radius;

    var x = r;
    var y;
     
    
    while (x > -r) {

        y = 0.05 * Math.sqrt(1 - (x * x) / (r * r)) - l;
        points.push([x, y]);
        x = x - 0.005;
        cntr++;
        if (cntr % 30 == 0) {
            pt.push([x, y]);
        }

    }

    x = -this.radius;

        
    cntr = 0;
    while (x < r) {

        y = -0.05 * Math.sqrt(1 - (x * x) / (r * r)) - l;
        points.push([x, y]);
        x = x + 0.005;
        cntr++;
        if (cntr % 30 == 0) {
            pt.push([x, y]);
        }
    }

    var sz = pt.length;
    for (var j = 0; j < sz; j++) {
        points.push([0, -l]);
        points.push(pt.pop());
    }

    return points;
}

    this.render = function render() {

        xformMatrix[12] = this.offSetX;
        xformMatrix[13] = this.offSetY;
        gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

        var cosB = Math.cos(this.rotation);
        var sinB = Math.sin(this.rotation);
        
        var rCntr;
        for(rCntr = 0;  rCntr < rotateMatrix.length-1; rCntr++){
            rotateMatrix[rCntr] = 0;
        }
        
        rotateMatrix[0] = cosB;
        rotateMatrix[1] = sinB;
        rotateMatrix[4] = -sinB;
        rotateMatrix[5] = cosB;
        rotateMatrix[10] = 1;
      
                
        gl.uniformMatrix4fv(u_rformMatrix, false, rotateMatrix);

    
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        var clr = this.setColor(this.bottom.length);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(clr), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.bottom), gl.STATIC_DRAW);
        gl.drawArrays(gl.LINE_STRIP, 0, this.bottom.length);

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        var clr = this.setColor(this.lines.length);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(clr), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.lines), gl.STATIC_DRAW);
        gl.drawArrays(gl.LINES, 0, this.lines.length);

    }
}

