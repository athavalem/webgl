function sphere() {

    points = [];

    var offSetX;
    var offSetY;
  
    var radius;
    var red;
    var green;
    var blue;


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

    this.calculatePoints = function calculatePoints() {

        var pts = [];

        var radians;

        for (theta = 0; theta < 360; theta = theta + 0.1) {
            radians = Math.PI * theta / 180.0;
            pts.push([(this.radius) * Math.cos(radians), (this.radius) * Math.sin(radians)]);
        }

        return pts;
    }

    this.render = function render() {

        xformMatrix[12] = this.offSetX;
        xformMatrix[13] = this.offSetY;
        gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

        var rad;
        var angle;
        
        var rCntr;
        for(rCntr = 0;  rCntr < rotateMatrix.length-1; rCntr++){
            rotateMatrix[rCntr] = 0;
        }
        
        for (angle = 0.0; angle < 180; angle = angle + 20) {
            rad = Math.PI * angle / 180.0;
            var cosB = Math.cos(rad);
            var sinB = Math.sin(rad);
            rotateMatrix[0] = cosB;
            rotateMatrix[2] = sinB;
            rotateMatrix[5] = 1;
            rotateMatrix[8] = -sinB;
            rotateMatrix[10] = cosB;
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            var clr = this.setColor(this.points.length);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(clr), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.uniformMatrix4fv(u_rformMatrix, false, rotateMatrix);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.points), gl.DYNAMIC_DRAW);

            gl.drawArrays(gl.LINE_STRIP, 0, this.points.length);

        }


        for (angle = 0.0; angle < 180; angle = angle + 20) {
            rad = Math.PI * angle / 180.0;
            var cosB = Math.cos(rad);
            var sinB = Math.sin(rad);
            rotateMatrix[0] = 1;
            rotateMatrix[5] = cosB;
            rotateMatrix[6] = -sinB;
            rotateMatrix[9] = sinB;
            rotateMatrix[10] = cosB;
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            var clr = this.setColor(this.points.length);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(clr), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.uniformMatrix4fv(u_rformMatrix, false, rotateMatrix);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.points), gl.DYNAMIC_DRAW);
            gl.drawArrays(gl.LINE_STRIP, 0, this.points.length);

        }

    }
}