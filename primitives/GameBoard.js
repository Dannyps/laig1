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
    };
    
    display() {
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        let boardTile = new Plane_Nurbs(this.scene,10,10); 
        for(let i = 0; i < this.size; i++) {
            boardTile.display();
            this.scene.translate(1, 0, 0);
        }
    }
};
