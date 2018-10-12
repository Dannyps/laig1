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
			
		let v1 = this.vert1;
		let v2 = this.vert2;
		let v3 = this.vert3;
		
		this.vertices = [
			v1.x, v1.y, v1.z,
			v2.x, v2.y, v2.z,
			v3.x, v3.y, v3.z,
		];

		let normal = NormalsUtils.calculateSurfaceNormal([v1, v2, v3])
		this.normals = [
			normal.x, normal.y, normal.z,
			normal.x, normal.y, normal.z,
			normal.x, normal.y, normal.z
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