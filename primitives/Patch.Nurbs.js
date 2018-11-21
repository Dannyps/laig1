'use strict';

class Patch_Nurbs extends CGFobject {

    constructor(scene, npartsu, npartsv, controlVertexes, npointsu, npointsv) {
        super(scene);
        let obj = new Nurbs(this.scene, npointsu-1, npointsv-1, controlVertexes, npartsu, npartsv);
        return obj;
    }
};