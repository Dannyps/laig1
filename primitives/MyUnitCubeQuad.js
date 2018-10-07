/**
 * MyUnitCube
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

class MyUnitCubeQuad extends CGFobject
{
	constructor(scene) 
	{
        super(scene);
        this.quad=new MyQuad(this.scene, 0, 1, 0, 1);
        this.quad.initBuffers();
    };
    
    display(){

        // face frente
        this.scene.pushMatrix();
        this.scene.translate(0,0,0.5);
        this.quad.display();
        this.scene.popMatrix();

        //face trás
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/180*180, 0, 1, 0);
        this.scene.translate(0,0,0.5);
        this.quad.display();
        this.scene.popMatrix();

        //face direita
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/180*90, 0, 1, 0);
        this.scene.translate(0,0,0.5);
        this.quad.display();
        this.scene.popMatrix();
        
        //face esquerda
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/180*-90, 0, 1, 0);
        this.scene.translate(0,0,0.5);
        this.quad.display();
        this.scene.popMatrix(); 

        //face cima
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/180*-90, 1, 0, 0);
        this.scene.translate(0,0,0.5);
        this.quad.display();
        this.scene.popMatrix();
        
        //face baixo
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI/180*90, 1, 0, 0);
        this.scene.translate(0,0,0.5);
        this.quad.display();
        this.scene.popMatrix();
    }

};
