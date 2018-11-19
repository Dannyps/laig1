'use strict';

class Cylinder_InSide_Nurbs extends CGFobject {

    constructor(scene, base, top, height, slices, stacks) {
        super(scene);

        let b = base;
        let t = top;
        let h = height;

        let controlVertexes=[	// U = 0
            [ // V = 0..1;
                [ b,  0, 0, 1], // 1
                [ b,  b, 0, 1], // 2
                [ 0,  b, 0, 1], // 3    
                [-b,  b, 0, 1], // 4
                [-b,  0, 0, 1], // 5
                [-b, -b, 0, 1], // 6
                [ 0, -b, 0, 1], // 7
                [ b, -b, 0, 1], // 8
                [ b,  0, 0, 1], // 9
            ],
            // U = 1
            [ // V = 0..1
                [ t,  0, h, 1], // 1
                [ t,  t, h, 1], // 2
                [ 0,  t, h, 1], // 3    
                [-t,  t, h, 1], // 4
                [-t,  0, h, 1], // 5
                [-t, -t, h, 1], // 6
                [ 0, -t, h, 1], // 7
                [ t, -t, h, 1], // 8
                [ t,  0, h, 1], // 9						 
            ]
        ]
        let obj = new Nurbs(this.scene, 1, 8, controlVertexes, stacks, slices);
        return obj;
    }
};