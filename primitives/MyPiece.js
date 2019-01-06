let _id = 0;

class MyPiece extends CGFobject {
	constructor(scene, colour, position_i, position_j) {
		super(scene);
		// initialize the top and bottom covers and the cylinder
		//this.pieceTop = new MyPieceTop(scene, 1);
		this.pieceSides = new Plane_Nurbs(scene, 10, 10);
		this.mat = new CGFappearance(scene);
		this.matSelected = new CGFappearance(scene);
		this.colour = colour;
		this.selected = false; // by default
		if(colour == 'white'){
			this.mat.setDiffuse(0.8, 0.8, 0.8,1);
			this.matSelected.setDiffuse(1, 1, 1, 1);
			this.matSelected.setAmbient(1, 1, 1, 1);
		}else{
			this.mat.setDiffuse(0.2, 0.2, 0.2,1);
			this.matSelected.setDiffuse(0.4, 0.4, 0.4, 1);
			this.matSelected.setAmbient(0.4, 0.4, 0.4, 1);
		}

		this.position_i = position_i;
		this.position_j = position_j;
		this.texture = this.scene.graph.parsedTextures.get('knight');
		this.id = _id++;
		this.ox = 0;
		this.oy = 0;
		this.oz = 0;
	};

	set_position_offset(x, y, z){
		this.ox = x;
		this.oy = y;
		this.oz = z;
		
	}

	display() {
		let material = this.selected ? this.matSelected :  this.mat;
		
		material.apply();
		// register for picking
		this.scene.registerPieceForPick(this);

		this.scene.pushMatrix();
		
			this.scene.translate(this.ox, this.oy, this.oz);
			
			this.scene.pushMatrix();
				this.scene.rotate(Math.PI * 1 / 2, -1, 0, 0);
				//this.pieceTop.display();
					this.scene.translate(0, 0, 1/5);
					this.texture.bind();
					this.pieceSides.display();
			this.scene.popMatrix();

			material.apply();

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

	getPosition() {
		return {i: this.position_i, j: this.position_j};
	}

	setPosition(i, j) {
		this.position_i = i;
		this.position_j = j;
	}

	getId() {
		return this.id;
	}

	clone() {
		let copy = Object.assign(Object.create(this), this);
		copy.selected = false;
		return copy;
	}
};