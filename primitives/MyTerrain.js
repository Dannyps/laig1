class MyTerrain extends CGFobject {
    constructor(scene, idtexture, idheightmap, parts, heightscale) {
        super(scene);

        this.scene = scene;
        // the shader
        this.shader = new CGFshader(this.scene.gl, "shaders/texture3.vert", "shaders/texture3.frag");
        this.shader.setUniformsValues({uSampler2: 1, normScale: 1});
        // the shader texture
        this.texture = scene.graph.parsedTextures.get(idtexture);
        // the shader height map
        this.heightmap = scene.graph.parsedTextures.get(idheightmap);
        // an appareance
        this.appearance = new CGFappearance(scene);
        this.appearance.setTexture(this.texture);
        this.appearance.setTextureWrap ('REPEAT', 'REPEAT');
        // the height scale
        this.heightscale = heightscale;
        // the plane nurb
        this.planeNURB = new Plane_Nurbs(scene, parts, parts);
    }

    display() {
        this.scene.setActiveShader(this.shader);
    
        this.scene.pushMatrix();
            this.heightmap.bind(1);
            this.appearance.apply();	
            this.planeNURB.display();
        this.scene.popMatrix();
        this.scene.setActiveShader(this.scene.defaultShader);
    }

}