/**
 * SemiSphere
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MySphere extends CGFobject
{
	constructor(scene, radius, slices, stacks){
		super(scene);

		this.radius = radius;
		this.slices = slices;
		this.stacks = stacks;

		this.initBuffers();
	};

	initBuffers(){
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		// Angles
		const theta = 2.0*Math.PI/this.slices; // the angle change around axis per slice
		const alfa = Math.PI/(this.stacks); // the angle change between poles per stack

		// Fill vertices
		for(let i = 0; i <= this.stacks; i++) {
			for(let j = 0; j <= this.slices; j++) {
				let vec = [this.radius*Math.cos(theta*j)*Math.sin(alfa*i), this.radius*Math.sin(theta*j)*Math.sin(alfa*i), this.radius*Math.cos(alfa*i)];

				this.vertices.push.apply(this.vertices, vec);
				this.normals.push.apply(this.normals, NormalsUtils.normalize(vec));
				this.texCoords.push(j/this.slices, i/this.stacks);
			}
		}

		// Fild indices (new)
		for(let i = 0; i < this.stacks; i++) {
			for(let j = 0; j < this.slices; j++) {
				this.indices.push(
					(this.slices + 1)*i + j,
					(this.slices + 1)*(i + 1) + j,
					(this.slices + 1)*(i + 1) + j + 1,
				);
				
				this.indices.push(
					(this.slices + 1)*i + j,
					(this.slices + 1)*(i + 1) + j + 1,
					(this.slices + 1)*i + j + 1,
				);
			}
		}

		this.primitiveType=this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	};
};
