'use strict';

class Patch_Nurbs extends CGFobject {

    /**
     *Creates an instance of Patch_Nurbs.
     * @param {*} scene
     * @param {*} npartsu divs u
     * @param {*} npartsv divs v
     * @param {*} controlVertexes controlVertexes array
     * @param {*} npointsu control points in u
     * @param {*} npointsv control points in v
     * @memberof Patch_Nurbs
     */
    constructor(scene, npartsu, npartsv, controlVertexes, npointsu, npointsv, texT, texS) {
        super(scene);
        let obj = new Nurbs(this.scene, npointsu-1, npointsv-1, controlVertexes, npartsu, npartsv, texS, texT);
        return obj;
    }
};