class MyPiece extends CGFobject {
	constructor(scene, colour) {
		super(scene);
		console.log(colour);
		// initialize the top and bottom covers and the cylinder
		this.pieceTop = new MyPieceTop(scene, 1);
		this.pieceSides = new Plane_Nurbs(scene, 10, 10);
		this.mat = new CGFappearance(scene);
		this.mat.setAmbient(0.2, 0.2, 0.2,1);
		this.mat.setDiffuse(1, 1, 1,1);
		this.selected = false; // by default
	};


	display() {

		this.pieceTop.selected = this.selected; // propagate changes

		// register for picking
		this.scene.myRegisterForPick(this);
		
		this.scene.pushMatrix();
			this.scene.rotate(Math.PI * 1 / 2, -1, 0, 0);
			//this.pieceTop.display();
				this.scene.translate(0, 0, 1/5);
				this.pieceSides.display();
		this.scene.popMatrix();

		this.mat.apply();
		this.scene.pushMatrix();
			this.scene.scale(1, 1/5, 1);

			this.scene.pushMatrix();
				this.scene.translate(1/2, 0.5, 0);
				this.scene.rotate(Math.PI * 1 / 2, 0, 1, 0);
				this.pieceSides.display();
			this.scene.popMatrix();

			this.scene.pushMatrix();
				this.scene.translate(0, 0.5, -1/2);
				this.scene.rotate(Math.PI * 1, 0, 1, 0);
				this.pieceSides.display();
			this.scene.popMatrix();

			this.scene.pushMatrix();
				this.scene.translate(-1/2, 0.5, 0);
				this.scene.rotate(Math.PI * 1/2, 0, -1, 0);
				this.pieceSides.display();
			this.scene.popMatrix();

			this.scene.pushMatrix();
				this.scene.translate(0, 0.5, 1/2);
				this.scene.rotate(Math.PI * 1, 0, 0, 0);
				this.pieceSides.display();
			this.scene.popMatrix();

		this.scene.popMatrix();
		this.scene.clearPickRegistration();
	}

	/**
	 * 
	 * @param Boolean is selected
	 */
	setSelected(sel){
		this.selected = sel;
	}
};