/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
class MyRectangle extends CGFobject
{
	constructor(scene, x1, y1, x2, y2) 
	{
        super(scene);
        
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
		
		this.initBuffers();

	};

	initBuffers() 
	{
			
		this.vertices = [
			this.x1, this.y1, 0,
			this.x1, this.y2, 0,
			this.x2, this.y1, 0,
			this.x2, this.y2, 0
		];

		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

		this.indices = [
			0, 2, 1, 
			1, 2, 3
		];

		this.texCoords = [
			0, 0,
			0, 1,
			1, 0,
			1, 1
		];

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};
