'use strict';

class Circle_Nurbs extends CGFobject {

    /**
     *Creates an instance of Circle_Nurbs.
     * @param {*} scene
     * @param {*} base
     * @param {*} slices
     * @param {*} stacks
     * @memberof Circle_Nurbs
     */
    constructor(scene, base, slices, stacks) {
        super(scene);

        let b = base;

        let controlVertexes=[	// U = 0
            [ // V = 0..1;
                [-1/3, -1/2, 0.0, 1 ],
                [-1/3, -1/2, 0.0, 1 ],
                [-1/2,  0, 0.0, 1 ],
                [-1/3,  1/2, 0.0, 1 ],
                [-1/3, -1/2, 0.0, 1 ]
                
            ],
            // U = 1
            [ // V = 0..1
                 [ 1/3, -1/2, 0.0, 1 ],
                 [ 1/2,  0, 0.0, 1 ],
                 [ 1/3,  1/2, 0.0, 1 ]							 
           ]
           
        ]
        let obj = new Nurbs(this.scene, 1, 2, controlVertexes, stacks, slices);
        return obj;
    }
};