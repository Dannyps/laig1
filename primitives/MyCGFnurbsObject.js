class MyCGFnurbsObject extends CGFnurbsObject {
    constructor(a, b, c, d) {
        super(a, b, c, d);
        this.d = d;
        this.b = b;
    }

    newTexCoords(tt, ts) {
        this.texCoords = [];

        let a, g, d, b;
        d = this.d;
        b = this.b;
        for (a = 0; a <= this.stacks; a++) {
            for (b = 0; b <= this.slices; b++) {
                d = b / this.slices;
                g = vec2.fromValues(b / this.slices, a / this.stacks);
                this.texCoords.push(g[0] * tt);
                this.texCoords.push((1.0 - g[1]) * ts);
            }
        }

        this.updateTexCoordsGLBuffers();
    }
}