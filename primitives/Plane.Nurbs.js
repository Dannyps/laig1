'use strict';

class Plane_Nurbs extends CGFobject {

    constructor(scene, npartsu, npartsv) {
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
        let obj = new Nurbs(this.scene, 1, 1, controlVertexes, npartsu, npartsv);
        return obj;
    }
};