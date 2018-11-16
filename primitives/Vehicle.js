class Vehicle extends CGFobject {
	constructor(scene) {
		super(scene);

		// initialize the top and bottom covers and the cylinder
		//this.baseCover = new Patch_Nurbs(scene, slices);
		//this.topCover = new MyCircle(scene, slices);
		this.cylinder = new Cylinder_Nurbs(scene, 1, 1, 1, 20, 5);
		this.baseCover = new MyCircle(scene, 20);
		this.baseCover2 = new MyCircle(scene, 20);
	};


	display() {
		this.scene.pushMatrix();
			this.scene.rotate(Math.PI * 1 / 2, 1, 0, 0);
			this.cylinder.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.translate(0.2, -1, 0);
			this.scene.scale(0.8, 1, 0.8);
			this.scene.rotate(Math.PI*1/2, -1, 0, 0);
			this.baseCover.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.translate(0.2, -1, 0);
			this.scene.scale(0.8, 1, 0.8);
			this.scene.rotate(Math.PI*1/2, 1, 0, 0);
			this.baseCover2.display();
		this.scene.popMatrix();
	}
};