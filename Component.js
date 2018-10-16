class Component {
    /**
     * 
     * @param {CGFscene} scene 
     * @param {Array.<parsedRotate | parsedScale | parsedTranslate>} transformation the array might be empty
     * @param {{primitivesID: string[], componentsID: string[]}} children
     */
    constructor(graph, scene, transformation, children) {
        this.graph = graph;
        this.scene = scene;
        this.transformation = transformation;
        this.children = children;
    }

    /**
     * 
     */
    display() {
        this.scene.pushMatrix();

        // apply transformations
        this.transformation.forEach((transf) => {
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
        });

        // iterate over the children
        // primitives
        this.children.primitivesID.forEach((primitiveId) => {
            this._displayPrimitive(this.graph.parsedPrimitives.get(primitiveId));
        });

        // iterate over the children of this component and call display
        this.scene.popMatrix();
    }

    /**
     * It creates the CGFObject for each kind of primitive
     * @param {*} primitive 
     */
    _displayPrimitive(primitive) {
        switch (primitive.type) {
            case 'rectangle':
                let rect = new MyRectangle(this.scene, primitive.x1, primitive.y1, primitive.x2, primitive.y2);
                rect.display();
                break;
            case 'triangle':
                let triangle = new MyTriangle(this.scene, {
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

                triangle.display();
                break;

            case 'cylinder':
                let cylinder = new MyCylinder(this.scene, primitive.base, primitive.top, primitive.height, primitive.slices, primitive.stacks);
                cylinder.display();
                break;

            case 'sphere':
                let sphere = new MySphere(this.scene, primitive.radius, primitive.slices, primitive.stacks);
                sphere.display();
            default:
                break;
        }
    }
}