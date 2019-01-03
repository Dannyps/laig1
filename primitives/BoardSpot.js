/**
 * Represents a board spot
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
class BoardSpot extends CGFobject {
    constructor(scene) {
        super(scene);

        let controlVertexes = [ // U = 0
            [ // V = 0..1;
                [-1 / 2, -1 / 2, 0.0, 1],
                [-1 / 2, 1 / 2, 0.0, 1]

            ],
            // U = 1
            [ // V = 0..1
                [1 / 2, -1 / 2, 0.0, 1],
                [1 / 2, 1 / 2, 0.0, 1]
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
                this.scene.translate(0, 0, i);
                this.scene.scale(0.8, 0.8, 1);
                this.scene.rotate(Math.PI / 2, 1, 0, 0);
                
                piece.display();
            this.scene.popMatrix();
            i += 0.21;
        });

    }


};