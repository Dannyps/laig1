'use strict';

class NormalsUtils {

    static vopp(p1, p2) {
        return {x:p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z};
    }

    static crossProduct(a, b) {
        // Check lengths
        if (a.length != 3 || b.length != 3) {
            return;
        }

        let res = [a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];

        return res;
    }

    static getPlaneByEdges(e1, e2) {
        return this.crossProduct(e1, e2);
    }

    /** 
     * @param {*} s selfVertex 
     * @param {*} vl VertexLeft 
     * @param {*} vr VertexRight
     * @param {*} vt VertexTop
     * @param {*} vb VertexBottom
     */
    static newell(s, vl, vr, vt, vb) {
        /*
                    y
                    ^
         P2         |		P1
                    vt        
                    |
                    |        
        --vl--------s---------vr---> x
                    |      
                    |
         P3  	    vb   	P4
                    |       

        */

        let p1, p2, p3, p4;

        p1 = this.getPlaneByEdges(this.vopp(s, vr), this.vopp(s, vt));
        p2 = this.getPlaneByEdges(this.vopp(s, vt), this.vopp(s, vl));
        p3 = this.getPlaneByEdges(this.vopp(s, vl), this.vopp(s, vb));
        p4 = this.getPlaneByEdges(this.vopp(s, vb), this.vopp(s, vr));

        let normalFinal = [
            p1[0] + p2[0] + p3[0] + p4[0],
            p1[1] + p2[1] + p3[1] + p4[1],
            p1[2] + p2[2] + p3[2] + p4[2],
        ];

        return normalFinal;
    }

    static normalize(n) {
        let norm = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
        n[0] /= norm;
        n[1] /= norm;
        n[2] /= norm;

        return n;
    }

    static calculateSurfaceNormal(t){

    let u = this.vopp(t[0], t[1]);
    let v = this.vopp(t[0], t[2]);

    let normal = [];

    normal.x = (u.y*v.z) - u.z*v.y;
    normal.y = (u.z*v.x) - u.x*v.z;
    normal.z = (u.x*v.y) - u.y*v.x;

	return normal;
    }
}