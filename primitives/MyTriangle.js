/**
 * MyTriangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
class MyTriangle extends CGFobject {
	/**
	 * 
	 * @param {*} scene 
	 * @param {*} coord1 {x, y, z}
	 * @param {*} coord2 {x, y, z}
	 * @param {*} coord3 {x, y, z}
	 */
	constructor(scene, vert1, vert2, vert3) {
		super(scene);

		this.vert1 = vert1;
		this.vert2 = vert2;
		this.vert3 = vert3;

		this.calcTexCoords();
		this.initBuffers();

	};

	calcTexCoords() {
		let x1, x2, x3, y1, y2, y3, z1, z2, z3;
		let v1 = this.vert1;
		let v2 = this.vert2;
		let v3 = this.vert3;

		x1 = v1.x;
		x2 = v2.x;
		x3 = v3.x;

		y1 = v1.y;
		y2 = v2.y;
		y3 = v3.y;

		z1 = v1.z;
		z2 = v2.z;
		z3 = v3.z;

		let a, b, c;

		a = Math.sqrt(Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2) + Math.pow(z1 - z3, 2));
		b = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
		c = Math.sqrt(Math.pow(x3 - x2, 2) + Math.pow(y3 - y2, 2) + Math.pow(z3 - z2, 2));



		let cosA = (-Math.pow(a, 2) + Math.pow(b, 2) + Math.pow(c, 2)) / (2 * b * c);
		let cosB = (Math.pow(a, 2) - Math.pow(b, 2) + Math.pow(c, 2)) / (2 * c * a);
		let cosG = (Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b);
		let sinB = Math.sqrt(1 - Math.pow(cosB, 2));

		this.texCoords = [c - a * cosB, 1-a* sinB,
			0, 0,
			a, 0
		];
	}

	initBuffers() {

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


		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
};