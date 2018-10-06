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

        this.idRoot = null;                    // The id of the root element.

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
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }
        
        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else if (index != VIEWS_INDEX) {
            this.onXMLMinorError("tag <views> out of order");
        } else {
            // Parse the views block 
            if ((error = this.parseViews(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            this.ambient = new Ambient(this);
            this.ambient.parse(nodes[index]);
        }
    }

    /**
     * Parses the <scene> block.
     */
    parseScene(mynode) {

        // É PRECISO TIRAR ESTAS VARIÁVEIS PARA FORA DA FUNÇÃO ASSIM QUE NECESSÁRIO


        var axis_length = this.reader.getFloat(mynode, "axis_length", false);
        if (this.ocurredGetError(axis_length)) {
            this.onXMLMinorError("unable to parse axis_length of the scene, using the default value (1.0)");
            axis_length = 1.0;
        } else {
            this.debug("Read axis_length as " + axis_length + ".");
        }

        this.referenceLength = axis_length;


        var root_object = this.reader.getString(mynode, "root", false);
        if (root_object == null || root_object == "") {
            this.onXMLError("unable to parse root of the scene, cannot proceed.");
        } else {
            this.debug("Read scene root as " + root_object + ".");
        }

        this.info("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     */
    parseViews(viewsNode) {
        
        let children = viewsNode.children;

        // Ensure there's at least one view
        if(children.length === 0) {
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
                if(id === null) return;

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
        if(!this.reader.hasAttribute(viewsNode, 'default')) {
            this.onXMLMinorError("Default view isn't set. Assuming TODO");
        }

        return null;
    }



    /**
     * Parses the <ambient> block.
     * @param {Element} ambientNode 
     */
    parseAmbient(ambientNode) {
        let ambient = null;
        let background = null;

        // el is an interface for Element
        // https://developer.mozilla.org/en-US/docs/Web/API/Element
        Array.prototype.forEach.call(ambientNode.children, ((el) => {
            if(el.tagName === 'ambient') {
                ambient = el;
            } else if(el.tagName === 'background') {
                background = el;
            }
        }));

        // parse ambient light
        this.ambientLight = {
            r: 0.5,
            g: 0.5,
            b: 0.5,
            a: 1
        };

        if(ambient === null) {
            this.onXMLMinorError("element <ambient>/<ambient> not set. Using default ambient light");
        } else {
            let requiredAttrsNames = ['r', 'g', 'b', 'a'];

            requiredAttrsNames.forEach(attrName => {
                if(ambient.hasAttribute(attrName)) {
                    let attrValue = Number.parseFloat(ambient.getAttribute(attrName));

                    if (isNaN(attrValue))
                        this.onXMLMinorError(`Attribute ${attrName} for ambient light should be float type, using fallback value`);
                    else
                        this.ambientLight[attrName] = attrValue;

                } else {
                    this.onXMLMinorError(`Attribute ${attrName} for ambient light is not set, using fallback value`);
                }
            });
        }

        // parse scene's background color
        this.backgroundScene = {
            r: 0.5,
            g: 0.5,
            b: 0.5,
            a: 1
        };

        if(background === null) {
            this.onXMLMinorError("element <ambient>/<background> not set. Using default background");
        } else {
            let requiredAttrsNames = ['r', 'g', 'b', 'a'];

            requiredAttrsNames.forEach(attrName => {
                if(background.hasAttribute(attrName)) {
                    let attrValue = Number.parseFloat(background.getAttribute(attrName));

                    if (isNaN(attrValue))
                        this.onXMLMinorError(`Attribute ${attrName} for background should be float type, using fallback value`);
                    else
                        this.backgroundScene[attrName] = attrValue;
                } else {
                    this.onXMLMinorError(`Attribute ${attrName} for background is not set, using fallback value`);
                }
            });
        }

        this.info("Parsed ambient");

        return null;
    }


    /**
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
            }
            else {
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
            }
            else
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
            }
            else
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

    /**
     * Parses the <TEXTURES> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        // TODO: Parse block

        console.log("Parsed textures");

        return null;
    }

    /**
     * Parses the <MATERIALS> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        // TODO: Parse block
        this.log("Parsed materials");
        return null;

    }

    /**
     * Parses the <NODES> block.
     * @param {nodes block element} nodesNode
     */
    parseNodes(nodesNode) {
        // TODO: Parse block
        this.log("Parsed nodes");
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
    }
}