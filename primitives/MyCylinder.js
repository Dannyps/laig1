/**
 * MyCylinder
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyCylinder extends CGFobject
{
	/**
	 * 
	 * @param {*} scene 
	 * @param {Number} base Radius for the base
	 * @param {Number} top Radius for the top
	 * @param {Number} height Height
	 * @param {Number} slices Number of slices
	 * @param {Number} stacks Number of stacks
	 */
	constructor(scene, base, top, height, slices, stacks){
		super(scene);

		this.base = base;
		this.top = top;
		this.height = height;
		this.slices = slices;
		this.stacks = stacks;

		this.initBuffers();
	};

	initBuffers(){
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		const radiusPerStack = (this.top - this.base)/this.stacks; // how much the radius changes from stack to stack
		const heightPerStack = this.height/this.stacks; // the height of each stack
		const theta = 2.0*Math.PI/this.slices; // External angle

		for(let i = 0; i <= this.slices; i++) {
			for(let j = 0; j <= this.stacks; j++) {
				let currRadius = this.base + j*radiusPerStack;
				this.vertices.push(currRadius*Math.cos(theta*i), currRadius*Math.sin(theta*i), j*heightPerStack);
				this.normals.push(Math.cos(theta*i),Math.sin(theta*i),0);
				this.texCoords.push(i*1/this.slices, j*1/this.stacks);
			}
		}

		for (let i = 0; i < this.slices; ++i) {
			for(let j = 0; j < this.stacks; ++j) {
				this.indices.push(
					(i+1)*(this.stacks+1) + j, i*(this.stacks+1) + j+1, i*(this.stacks+1) + j,
					i*(this.stacks+1) + j+1, (i+1)*(this.stacks+1) + j, (i+1)*(this.stacks+1) + j+1
				);
			}
		}

		this.primitiveType=this.scene.gl.TRIANGLES;

		this.initGLBuffers();
	};
};
