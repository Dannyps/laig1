class Component {
    /**
     * 
     * @param {CGFscene} scene 
     * @param {component} properties 
     */
    constructor(graph, scene, properties) {
        this.graph = graph;
        this.scene = scene;
        this.transformation = properties.transformation; /** @type {Array.<parsedRotate | parsedScale | parsedTranslate>} */
        this.children = properties.children; /** @type  {{primitivesID: string[], componentsID: string[]}} */
        this.materials = properties.materials;
        this.currMaterial = 0; // index for current material
        // create cgf objects for each direct primitive child
        this.CGFprimitives = new Map();
    }

    /**
     * 
     */
    display() {
        this.scene.pushMatrix();

        // apply transformations
        for(let i = this.transformation.length - 1; i >= 0; i--) {
            let transf = this.transformation[i];
            switch(transf.type) {
                case 'translate':
                    this.scene.translate(transf.x, transf.y, transf.z);
                    break;
                case 'rotate':
                    if(transf.axis === 'x')
                        this.scene.rotate(transf.angle*Math.PI/180, 1, 0, 0);
                    else if(transf.axis === 'y')
                        this.scene.rotate(transf.angle*Math.PI/180, 0, 1, 0);
                    else if(transf.axis === 'z')
                        this.scene.rotate(transf.angle*Math.PI/180, 0, 0, 1);
                    break;
                case 'scale':
                    this.scene.scale(transf.x, transf.y, transf.z);
                    break;
            }
        }

        // apply material
        // check if M was pressed
        if(this.scene.updateMaterials)
            this.currMaterial = (this.currMaterial + 1) % this.materials.length;
           
        if(this.materials[this.currMaterial] !== 'inherit')
            this.graph.parsedMaterials.get(this.materials[this.currMaterial]).apply();
        
        // iterate over the children
        // primitives
        this.children.primitivesID.forEach((primitiveId) => {
            if(!this.CGFprimitives.has(primitiveId))
                this._initCGFprimitive(primitiveId);

            this.CGFprimitives.get(primitiveId).display();
        });

        this.children.componentsID.forEach((componentId) => {
            this.graph.parsedComponents.get(componentId).display();
        })

        // iterate over the children of this component and call display
        this.scene.popMatrix();
    }

    /**
     * It creates the CGFObject for each kind of primitive
     * @param {*} primitive 
     */
    _initCGFprimitive(primitiveId) {
        let primitive = this.graph.parsedPrimitives.get(primitiveId);
        let cgfObj;
        switch (primitive.type) {
            case 'rectangle':
                cgfObj= new MyRectangle(this.scene, primitive.x1, primitive.y1, primitive.x2, primitive.y2);
                break;
            case 'triangle':
                cgfObj = new MyTriangle(this.scene, {
                    x: primitive.x1,
                    y: primitive.y1,
                    z: primitive.z1
                }, {
                    x: primitive.x2,
                    y: primitive.y2,
                    z: primitive.z2
                }, {
                    x: primitive.x3,
                    y: primitive.y3,
                    z: primitive.z3
                });

                break;

            case 'cylinder':
                cgfObj = new MyCylinder(this.scene, primitive.base, primitive.top, primitive.height, primitive.slices, primitive.stacks);
                break;

            case 'sphere':
                cgfObj = new MySphere(this.scene, primitive.radius, primitive.slices, primitive.stacks);
            default:
                break;
        }

        this.CGFprimitives.set(primitiveId, cgfObj);
    }
}