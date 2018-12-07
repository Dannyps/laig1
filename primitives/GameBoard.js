/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
class GameBoard extends CGFobject
{
	constructor(scene, initialSize) 
	{
        super(scene);
        this.scene = scene;
        this.size = initialSize;

        this.whitePlace = new CGFappearance(scene);
        this.whitePlace.setAmbient(1,1,1,1);

        this.darkPlace = new CGFappearance(scene);
        this.darkPlace.setAmbient(0,0,0,1);
    };
    
    display() {
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.scene.translate(-this.size/2+0.5, -this.size/2+0.5, 0);
        let boardTile = new Plane_Nurbs(this.scene,10,10); 
        for(let i = 0; i < this.size; i++) {
            for(let j = 0; j < this.size; j++) {
                if((i+j) % 2)
                    this.darkPlace.apply();
                else
                    this.whitePlace.apply();
                
                boardTile.display();
                this.scene.translate(1, 0, 0);
            }
            this.scene.translate(-this.size,1,0);
        }
        
    }
};
