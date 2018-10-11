/**
 * MyCircle 
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCircle extends CGFobject
{
	constructor(scene, slices){
		super(scene);

		this.slices = slices;

		this.initBuffers();
	};

	initBuffers(){
		this.vertices = [];

		this.indices = [];

		this.normals = [];

		this.texCoords = [];

		// External angle
		const theta = 2.0*Math.PI/this.slices; 
		
        // Fill vertices
		for(let j = 0; j < this.slices; j++) {
            this.vertices.push(Math.cos(theta*j), Math.sin(theta*j), 0);
            this.normals.push(0,0, 1);
            this.texCoords.push(0.5 * (1 + Math.cos(theta * j)), 0.5 * (1 - Math.sin(theta * j)));
		}
		
		this.vertices.push(0, 0, 0); // center
		this.normals.push(0,0,1);
		this.texCoords.push(0.5, 0.5);

		// Fill indices
		for(let j = 0; j < this.slices; j++) {
            this.indices.push(
                this.slices, j, (j+1)%this.slices
            );
        }

		this.primitiveType=this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	};
};
