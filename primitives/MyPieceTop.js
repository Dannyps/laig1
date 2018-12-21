class MyPieceTop extends CGFobject {
    constructor(scene, heightscale) {
        super(scene);

        this.scene = scene;
        // the shader
        this.shader = new CGFshader(this.scene.gl, "shaders/knight.vert", "shaders/knight.frag");

        this.shader.setUniformsValues({
            uSampler2: 1,
            normScale: 1,
            selected: 0
        });

        // the shader texture
        this.texture = new CGFtexture(scene, "scenes/images/printedsurface.jpg");
        // the shader height map
        this.heightmap = new CGFtexture(scene, "scenes/images/knight.png");
        // the height scale
        this.heightscale = heightscale;
        // the plane nurb
        this.planeNURB = new Plane_Nurbs(scene, 50, 50);
    }

    display() {
        this.scene.setActiveShader(this.shader);

        this.shader.setUniformsValues({
            uSampler2: 1,
            normScale: 1,
            selected: this.selected
        });

        this.scene.pushMatrix(); {
            this.texture.bind();
            this.heightmap.bind(1);
            this.planeNURB.display();
        }
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
    }

}