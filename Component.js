class Component {
    /**
     * 
     * @param {CGFscene} scene 
     * @param {component} properties 
     */
    constructor(graph, scene, properties, name) {
        this.graph = graph;
        this.scene = scene;
        this.transformation = properties.transformation; /** @type {Array.<parsedRotate | parsedScale | parsedTranslate>} */
        this.animations = _initOwnAnimations(graph, properties.animations);
        this.children = properties.children; /** @type  {{primitivesID: string[], componentsID: string[]}} */
        this.materials = properties.materials;
        this.texture = properties.texture;
        this.name = name;
        this.currMaterial = 0; // index for current material
        // create cgf objects for each direct primitive child
        this.CGFprimitives = new Map();
    }

    findCycles(parent) {
        this.parent = parent;
        let p = parent;
        while (p != null) {
            if (p.name == this.name) {
                alert("Scenegraph has loops!");
                console.error("Scene graph has loops!");

                throw "Loops in graph.";
            }
            p = p.parent;
        }
        this.children.componentsID.forEach((componentId) => {
            let c = this.graph.parsedComponents.get(componentId);

            if (c == undefined) {
                throw "A declared component was not found! (" + componentId + ")";
            } else
                c.findCycles(this);
        })
    }

    pushTexCoords(el) {

        this.ols = el.texture.length_s;
        this.olt = el.texture.length_t;

        let pls, plt; // parent length_s/t
        if (el.parent == null) {
            pls = 1;
            plt = 1;
        } else {
            pls = el.parent.texture.length_s;
            plt = el.parent.texture.length_t;

        }
        el.texture.length_s *= pls;
        el.texture.length_t *= plt;

        return [el.texture.length_s, el.texture.length_t];
    }

    popTexCoords(el) {
        el.texture.length_s = this.ols;
        el.texture.length_t = this.olt;
    }



    /**
     * 
     */
    display(parent) {

        this.parent = parent;
        this.scene.pushMatrix();

        // apply animation
        this.animations.forEach(anim => {
            anim.update(this.scene.currSysTime);
            anim.apply(this.scene);
        });

        // apply transformations
        for (let i = 0; i < this.transformation.length; i++) {
            let transf = this.transformation[i];
            switch (transf.type) {
                case 'translate':
                    this.scene.translate(transf.x, transf.y, transf.z);
                    break;
                case 'rotate':
                    if (transf.axis === 'x')
                        this.scene.rotate(transf.angle * Math.PI / 180, 1, 0, 0);
                    else if (transf.axis === 'y')
                        this.scene.rotate(transf.angle * Math.PI / 180, 0, 1, 0);
                    else if (transf.axis === 'z')
                        this.scene.rotate(transf.angle * Math.PI / 180, 0, 0, 1);
                    break;
                case 'scale':
                    this.scene.scale(transf.x, transf.y, transf.z);
                    break;
            }
        }

        // apply material
        // check if M was pressed
        if (this.scene.updateMaterials)
            this.currMaterial = (this.currMaterial + 1) % this.materials.length;

        let currentMaterialId = this.materials[this.currMaterial];
        if (parent == null) {
            // displaying the root node.
            if (currentMaterialId == 'inherit') {
                console.error("Root node cannot inherit");
                throw "Root node must not inherit.";
            }
            this.material = this.graph.parsedMaterials.get(currentMaterialId);
        } else {
            // this is a child node
            if (currentMaterialId === 'inherit') {
                this.material = parent.material;
            } else {
                this.material = this.graph.parsedMaterials.get(currentMaterialId);
                if (this.material == undefined) {
                    console.error("Broken material ref: " + currentMaterialId);
                    throw "Broken material ref: " + currentMaterialId;
                }
            }
        }

        // apply texture
        if (this.texture.id !== 'inherit' && this.texture.id != 'none') {
            let tex = this.graph.parsedTextures.get(this.texture.id);
            if (tex == undefined) {
                console.error("Broken texture ref: " + this.texture.id);
                throw "Broken texture ref: " + this.texture.id;
            }
            this.material.setTexture(tex);

        } else if (this.texture.id == 'none') {
            this.material.setTexture(null);
        }

        let tc = this.pushTexCoords(this);

        let ls = tc[0];
        let lt = tc[1];

        this.material.apply();

        // iterate over the children
        // primitives
        this.children.primitivesID.forEach((primitiveId) => {
            if (!this.CGFprimitives.has(primitiveId))
                this._initCGFprimitive(primitiveId);
            let myprim = this.CGFprimitives.get(primitiveId);

            if (primitiveId == "pRect") {
                myprim.texCoords = [
                    0, ls,
                    0, 0,
                    lt, ls,
                    lt, 0

                ];
            }

            myprim.updateTexCoordsGLBuffers();
            myprim.display(this);


        });

        this.children.componentsID.forEach((componentId) => {
            this.graph.parsedComponents.get(componentId).display(this);
        })

        // iterate over the children of this component and call display
        this.scene.popMatrix();

        this.popTexCoords(this);
    }

    /**
     * It creates the CGFObject for each kind of primitive
     * @param {*} primitive 
     */
    _initCGFprimitive(primitiveId) {
        let primitive = this.graph.parsedPrimitives.get(primitiveId);
        if (primitive == undefined) {
            console.error("Broken primitive ref: " + primitiveId);
            throw "Broken primitive ref: " + primitiveId;
        }
        let cgfObj;
        switch (primitive.type) {
            case 'rectangle':
                cgfObj = new MyRectangle(this.scene, primitive.x1, primitive.y1, primitive.x2, primitive.y2);
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
                break;
            case 'torus':
                cgfObj = new MyTorus(this.scene, primitive.inner, primitive.outer, primitive.slices, primitive.loops);
                break;
            default:
                break;
        }

        this.CGFprimitives.set(primitiveId, cgfObj);
    }
}

/**
 * Returns an array of animations
 * @param {MySceneGraph} sceneGraph 
 * @param {string[]} animationIDs 
 * 
 * @return {Animation[]}
 */
function _initOwnAnimations(sceneGraph, animationIDs) {
    if(!animationIDs) return [];

    let animations = [];

    animationIDs.forEach(animationID => {
        let animProperties = sceneGraph.parsedAnimations.get(animationID);
        if(animProperties.type === 'linear')
            animations.push(new LinearAnimation(animProperties));
        else if(animProperties.type === 'circular')
            animations.push(new CircularAnimation(animProperties));
    });

    return animations;
}