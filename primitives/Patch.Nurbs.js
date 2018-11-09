'use strict';

class Patch_Nurbs extends CGFobject {

    constructor(scene, npartsu, npartsv, controlVertexes, npointsu, npointsv) {
        super(scene);
        debugger;
        let obj = new Nurbs(this.scene, npointsu, npointsv, npartsu, npartsv, controlVertexes);
        return obj;
    }
};