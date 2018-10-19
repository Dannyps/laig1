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

		// initialize the top and bottom covers and the cylinder
		this.baseCover = new MyCircle(scene, slices);
		this.topCover = new MyCircle(scene, slices);
		this.cylinder = new MyCylinderNoCovers(scene, base, top, height, slices, stacks);
	};


	display() {
		this.scene.pushMatrix();
			this.cylinder.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.scale(this.cylinder.base, this.cylinder.base, 1);
			this.scene.rotate(Math.PI, 1, 0, 0);
			this.baseCover.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.scale(this.cylinder.top, this.cylinder.top, 1);
			this.scene.translate(0, 0, this.cylinder.height);
			this.topCover.display();
		this.scene.popMatrix();
	}
};
