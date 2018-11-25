class Vehicle extends CGFobject {
	constructor(scene) {
		super(scene);

		// initialize the top and bottom covers and the cylinder
		this.cylinder = new Cylinder_Nurbs(scene, 1, 1, 1, 20, 5);
		this.cover = new Cylinder_Nurbs(scene, 1, 1, 1, 20, 5);
		this.cylinder2 = new Cylinder_InSide_Nurbs(scene, 1, 1, 1, 20, 5);
		this.baseCover = new MyCircle(scene, 20);
		this.balloon = new Balloon_Nurbs(scene);
		this.rope = new MyCylinder(scene, 0.01, 0.01, 1, 10, 10);
	};


	display() {
		this.scene.pushMatrix();
			this.scene.rotate(Math.PI * 1 / 2, 1, 0, 0);
			this.cylinder.display();
			this.cylinder2.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.translate(0.2, -1, 0);
			this.scene.scale(0.8, 1, 0.8);
			this.scene.rotate(Math.PI * 1 / 2, -1, 0, 0);
			this.baseCover.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.translate(0.2, -1, 0);
			this.scene.scale(0.8, 1, 0.8);
			this.scene.rotate(Math.PI * 1 / 2, 1, 0, 0);
			this.baseCover.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.scale(1, 2, 1);
			this.scene.translate(1, 1, 0);
			this.scene.rotate(Math.PI * 1 / 2, 1, 0, 0);
			this.rope.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.scale(1, 2, 1);
			this.scene.translate(-0.635, 1, 0);
			this.scene.rotate(Math.PI * 1 / 2, 1, 0, 0);
			this.rope.display();
		this.scene.popMatrix();
		
		this.scene.pushMatrix();
			this.scene.translate(0, 2, 0);
			this.scene.rotate(Math.PI * 1 / 2, -1, 0, 0);
			this.balloon.display();
		this.scene.popMatrix();
	}
};