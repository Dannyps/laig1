/**
 * Torus
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyTorus extends CGFobject
{
    /**
     * 
     * @param {*} scene 
     * @param {*} innerRadius The radius of each inner circumferences
     * @param {*} outterRadius The torus radius
     * @param {*} slices Number of circumferences composing the torus
     * @param {*} loops Number of vertices per circumference
     */
	constructor(scene, innerRadius, outterRadius, slices, loops){
		super(scene);

        this.innerRadius = innerRadius;
        this.outterRadius = outterRadius;
        this.slices = slices;
        this.loops = loops;

		this.initBuffers();
	};

	initBuffers(){
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		// Angles
		const innerAngleShift = 2.0*Math.PI/this.loops; // the angle change inside circumferences
		const outterAngleShift = 2.0*Math.PI/this.slices; // the angle change between circumferences composing the torus

        // Fill vertices
        for(let i = 0; i <= this.loops; i++) {
            for(let j = 0; j <= this.slices; j++) {
                let innerAngle = innerAngleShift*i, outterAngle = outterAngleShift*j;

                let vec = [
                    (this.outterRadius + this.innerRadius*Math.cos(outterAngle))*Math.cos(innerAngle),
                    (this.outterRadius + this.innerRadius*Math.cos(outterAngle))*Math.sin(innerAngle),
                    this.innerRadius*Math.sin(outterAngle)
                ];

                this.vertices.push.apply(this.vertices, vec);
                this.normals.push.apply(this.normals, NormalsUtils.normalize(vec));
            }
        }

		// Fild indices (new)
        for (let i = 0; i < this.loops; i++) {
            for (let j = 0; j < this.slices; j++) {
                this.indices.push(
                    (this.slices + 1)*j + i, 
                    (this.slices + 1)*j + i + this.slices + 1,
                    (this.slices + 1)*j + i + this.slices + 2
                );

                this.indices.push(
                    (this.slices + 1)*j + i, 
                    (this.slices + 1)*j + i + this.slices + 2,
                    (this.slices + 1)*j + i + 1
                );
            }
        }

		this.primitiveType=this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	};
};
