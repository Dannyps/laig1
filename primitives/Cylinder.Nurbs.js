'use strict';

class Cylinder_Nurbs extends CGFobject {


    /**
     *Creates an instance of Cylinder_Nurbs.
     * @param {*} scene
     * @param {*} base
     * @param {*} top
     * @param {*} height
     * @param {*} slices
     * @param {*} stacks
     * @memberof Cylinder_Nurbs
     */
    constructor(scene, base, top, height, slices, stacks) {
        super(scene);

        let b = base;
        let t = top;
        let h = height;

        let controlVertexes=[	// U = 0
            [ // V = 0..1;
                [ b,  0, 0, 1], // 9
                [ b, -b, 0, 1], // 8
                [ 0, -b, 0, 1], // 7
                [-b, -b, 0, 1], // 6
                [-b,  0, 0, 1], // 5
                [-b,  b, 0, 1], // 4
                [ 0,  b, 0, 1], // 3    
                [ b,  b, 0, 1], // 2
                [ b,  0, 0, 1], // 1
            ],
            // U = 1
            [ // V = 0..1
                [ t,  0, h, 1], // 9
                [ t, -t, h, 1], // 8
                [ 0, -t, h, 1], // 7
                [-t, -t, h, 1], // 6
                [-t,  0, h, 1], // 5
                [-t,  t, h, 1], // 4
                [ 0,  t, h, 1], // 3    
                [ t,  t, h, 1], // 2
                [ t,  0, h, 1], // 1						 
            ]
        ]
        let obj = new Nurbs(this.scene, 1, 8, controlVertexes, stacks, slices);
        return obj;
    }
};