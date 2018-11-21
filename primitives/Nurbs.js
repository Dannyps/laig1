'use strict';

class Nurbs extends CGFobject {

    /**
     * 
     * @param {int} degree1 
     * @param {int} degree2 
     * @param {Array} controlvertexes 
     * @param {int} npartsu 
     * @param {int} npartsv 
     */
    constructor(scene, degree1, degree2, controlvertexes, npartsu, npartsv) {
        super(scene);

        var nurbsSurface = new CGFnurbsSurface(degree1, degree2, controlvertexes);

        var obj = new CGFnurbsObject(this.scene, npartsu, npartsv, nurbsSurface); // must provide an object with the function getPoint(u, v) (CGFnurbsSurface has it)
        
        return obj;
    }
};