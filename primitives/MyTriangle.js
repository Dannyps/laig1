/**
 * MyTriangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
class MyTriangle extends CGFobject
{
    /**
     * 
     * @param {*} scene 
     * @param {*} coord1 {x, y, z}
     * @param {*} coord2 {x, y, z}
     * @param {*} coord3 {x, y, z}
     */
	constructor(scene, vert1, vert2, vert3) 
	{
        super(scene);
        
        this.vert1 = vert1;
        this.vert2 = vert2;
        this.vert3 = vert3;
		
		this.initBuffers();

	};

	initBuffers() 
	{
			
		this.vertices = [
			this.vert1.x, this.vert1.y, this.vert1.z,
			this.vert2.x, this.vert2.y, this.vert2.z,
			this.vert3.x, this.vert3.y, this.vert3.z,
		];

		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];

		this.indices = [
			0, 1, 2
		];

        // TODO
        // Review this
		this.texCoords = [
			0, 0,
			1, 0,
			0.5, 1
		];

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};