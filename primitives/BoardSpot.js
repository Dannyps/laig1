/**
 * Represents a board spot
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
class BoardSpot extends CGFobject {
    constructor(scene) {
        super(scene);

        let controlVertexes=[	// U = 0
            [ // V = 0..1;
                 [-1/2, -1/2, 0.0, 1 ],
                 [-1/2,  1/2, 0.0, 1 ]
                
            ],
            // U = 1
            [ // V = 0..1
                 [ 1/2, -1/2, 0.0, 1 ],
                 [ 1/2,  1/2, 0.0, 1 ]							 
            ]
        ]
        this.spotFloor = new Nurbs(this.scene, 1, 1, controlVertexes, 10, 10);
        this.pieces = [];
    };

    display() {

        this.spotFloor.display();

        let i = 0;
        this.pieces.forEach(piece => {
            this.scene.pushMatrix();
                this.scene.translate(0, 0, ++i);
                piece.display();
            this.scene.popMatrix();
        });

    }


};