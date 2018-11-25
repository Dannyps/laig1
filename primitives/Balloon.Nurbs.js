'use strict';

class Balloon_Nurbs extends CGFobject {

    constructor(scene) {
        super(scene);

        let b = 1;
        let m = 2.3;
        let t = 0.2;

        let h = 1.5;

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
            [ // V = 0..1
                [ m,  0, h, 1], // 9
                [ m, -m, h, 1], // 8
                [ 0, -m, h, 1], // 7
                [-m, -m, h, 1], // 6
                [-m,  0, h, 1], // 5
                [-m,  m, h, 1], // 4
                [ 0,  m, h, 1], // 3    
                [ m,  m, h, 1], // 2
                [ m,  0, h, 1], // 1						 
            ]
            ,
            [ // V = 0..1
                [ t,  0, 2, 1], // 9
                [ t, -t, 2, 1], // 8
                [ 0, -t, 2, 1], // 7
                [-t, -t, 2, 1], // 6
                [-t,  0, 2, 1], // 5
                [-t,  t, 2, 1], // 4
                [ 0,  t, 2, 1], // 3    
                [ t,  t, 2, 1], // 2
                [ t,  0, 2, 1], // 1						 
            ]
        ]
        this.obj = new Nurbs(this.scene, 2, 8, controlVertexes, 30, 30);

        this.text = new CGFappearance(this.scene);
        this.text.loadTexture("scenes/images/x.png");
        this.text.setAmbient(0.1,0.1,0.1,0.0);
        this.text.setDiffuse(0.5, 0.5, 0.5, 1);
        this.text.setSpecular(0.2, 0.2, 0.2, 1);
        this.text.setShininess(1);
    }

    display(){
        this.scene.pushMatrix();
            this.text.apply();
            this.obj.display();
        this.scene.popMatrix();
    }
};