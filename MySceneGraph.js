var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null; // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */

        this.reader.open('scenes/' + filename, this);
    }


    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.info("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "yas")
            return "root tag <yas> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order");

            //Parse scene block
            let scene = new Scene(this);
            if ((error = scene.parse(nodes[index])) != null)
                return error;

            this.info('Parsed scene');
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else if (index != VIEWS_INDEX) {
            this.onXMLMinorError("tag <views> out of order");
        } else {
            // Parse the views block 
            //if ((error = this.parseViews(nodes[index])) != null)
            //return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            this.ambient = new Ambient(this);
            if ((error = this.ambient.parse(nodes[index])) != null)
                return error;


            this.info('Parsed ambient');
        }

        // lights
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse ambient block
            this.parsedLights = new Lights(this);
            this.parsedLights.parse(nodes[index]);

            this.info('Parsed lights');
        }

        // // textures
        // if ((index = nodeNames.indexOf("textures")) == -1)
        //     return "tag <textures> missing";
        // else {
        //     if (index != TEXTURES_INDEX)
        //         this.onXMLMinorError("tag <textures> out of order");

        //     //Parse ambient block
        //     this.parsedTextures = new Textures(this);
        //     this.parsedTextures.parse(nodes[index]);

        //     this.info('Parsed textures');
        // }

        // material
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse ambient block
            this.parsedMaterials = new Materials(this);
            this.parsedMaterials.parse(nodes[index]);

            this.info('Parsed materials');
        }

        // transformations
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse ambient block
            this.parsedTransformations = new Transformations(this);
            this.parsedTransformations.parse(nodes[index]);

            this.info('Parsed transformations');
        }


        // primitives
        if ((index = nodeNames.indexOf("primitives")) == -1) {
            return "tag <primitives> missing";

        } else {

            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");
            //Parse primitives block
            this.parsedPrimitives = new Primitives(this);
            if ((error = this.parsedPrimitives.parse(nodes[index])) != null) {
                return error;
            }
            this.info('Parsed primitives');
        }

        // components

        console.log(nodeNames);
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            this.parsedComponents = new Components2(this);
            if ((error = this.parsedComponents.parse(nodes[index])) !== null)
                return error;

            this.info('Parsed components');
        }
    }

    /**
     * Parses the <views> block.
     */
    parseViews(viewsNode) {

        let children = viewsNode.children;

        // Ensure there's at least one view
        if (children.length === 0) {
            this.onXMLError("You must specify at least one view under <views> tag");
            return;
        }

        this.orthoViews = [];

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName === 'ortho') {
                let id = this.reader.getString(children[i], 'id', true);
                let near = this.reader.getFloat(children[i], 'near', false);
                let far = this.reader.getFloat(children[i], 'far', false);
                let left = this.reader.getFloat(children[i], 'left', false);
                let right = this.reader.getFloat(children[i], 'right', false);
                let top = this.reader.getFloat(children[i], 'top', false);
                let bottom = this.reader.getFloat(children[i], 'top', false);

                // check if required attributes are defined
                if (id === null) return;

                this.orthoViews.push({
                    id: id,
                    near: near ? near : 0.1,
                    far: far ? far : 1000,
                    left: left ? left : undefined,
                    right: right ? right : undefined,
                    top: top ? top : undefined,
                    top: bottom ? bottom : undefined,
                });
            }
        }

        // check if default perspective is defined
        if (!this.reader.hasAttribute(viewsNode, 'default')) {
            this.onXMLMinorError("Default view isn't set. Assuming TODO");
        } else {
            this.defaultView = this.reader.getString(viewsNode, 'default', true);
        }

        this.log("Parsed views");
        return null;
    }

    /**
     * @deprecated
     * Parses the <LIGHTS> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {

        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "LIGHT") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            // Gets indices of each element.
            var enableIndex = nodeNames.indexOf("enable");
            var positionIndex = nodeNames.indexOf("position");
            var ambientIndex = nodeNames.indexOf("ambient");
            var diffuseIndex = nodeNames.indexOf("diffuse");
            var specularIndex = nodeNames.indexOf("specular");

            // Light enable/disable
            var enableLight = true;
            if (enableIndex == -1) {
                this.onXMLMinorError("enable value missing for ID = " + lightId + "; assuming 'value = 1'");
            } else {
                var aux = this.reader.getFloat(grandChildren[enableIndex], 'value');
                if (!(aux != null && !isNaN(aux) && (aux == 0 || aux == 1)))
                    this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
                else
                    enableLight = aux == 0 ? false : true;
            }

            // Retrieves the light position.
            var positionLight = [];
            if (positionIndex != -1) {
                // x
                var x = this.reader.getFloat(grandChildren[positionIndex], 'x');
                if (!(x != null && !isNaN(x)))
                    return "unable to parse x-coordinate of the light position for ID = " + lightId;
                else
                    positionLight.push(x);

                // y
                var y = this.reader.getFloat(grandChildren[positionIndex], 'y');
                if (!(y != null && !isNaN(y)))
                    return "unable to parse y-coordinate of the light position for ID = " + lightId;
                else
                    positionLight.push(y);

                // z
                var z = this.reader.getFloat(grandChildren[positionIndex], 'z');
                if (!(z != null && !isNaN(z)))
                    return "unable to parse z-coordinate of the light position for ID = " + lightId;
                else
                    positionLight.push(z);

                // w
                var w = this.reader.getFloat(grandChildren[positionIndex], 'w');
                if (!(w != null && !isNaN(w) && w >= 0 && w <= 1))
                    return "unable to parse x-coordinate of the light position for ID = " + lightId;
                else
                    positionLight.push(w);
            } else
                return "light position undefined for ID = " + lightId;

            // Retrieves the ambient component.
            var ambientIllumination = [];
            if (ambientIndex != -1) {
                // R
                var r = this.reader.getFloat(grandChildren[ambientIndex], 'r');
                if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
                    return "unable to parse R component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(r);

                // G
                var g = this.reader.getFloat(grandChildren[ambientIndex], 'g');
                if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
                    return "unable to parse G component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(g);

                // B
                var b = this.reader.getFloat(grandChildren[ambientIndex], 'b');
                if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
                    return "unable to parse B component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(b);

                // A
                var a = this.reader.getFloat(grandChildren[ambientIndex], 'a');
                if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
                    return "unable to parse A component of the ambient illumination for ID = " + lightId;
                else
                    ambientIllumination.push(a);
            } else
                return "ambient component undefined for ID = " + lightId;

            // TODO: Retrieve the diffuse component

            // TODO: Retrieve the specular component

            // TODO: Store Light global information.
            //this.lights[lightId] = ...;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");

        return null;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }


    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Callback to be executed on any info message.
     * @param {string} message
     */
    info(message) {
        console.info("%c" + message, "color: blue; font-size: inherit");
    }

    /**
     * Callback to be executed on any debug message.
     * @param {string} message
     */
    debug(message) {
        console.info("%c" + message, "color: lightgreen; background:black; padding:0.2em; font-size: inherit");
    }

    /**
     * Attribute read error detector wrapper.
     * @param {string} message
     */
    ocurredGetError(arg) {
        return (!(arg != null && !isNaN(arg)))
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        // entry point for graph rendering
        //TODO: Render loop starting at root of graph

        // TEST for rendering primitives
        this.parsedPrimitives.getPrimitives().forEach((primitive, id) => {
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
                default:
                    break;
            }
        });
    }
}