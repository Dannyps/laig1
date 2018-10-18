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

        /**
         * Scene information
         */

        /** @description the scene root's node id @type {string} */
        this.idRoot;
        /** @description the axis lenght @type {number} */
        this.referenceLength;

        this.axisCoords = []; // set axis coordinates
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        /**
         * Cameras information
         */

        /** @description the default camera ID @type {string} */
        this.defaultCamera;
        /** @description all parsed views @type {{Map.<string, (perspectiveView|orthoView)>}} */
        this.views;

        /**
         * Ambient information such ambient light and scene's background color
         */

        /** @description the ambient light for the scene @type {{r: number, g: number, b: number, a: number}} */
        this.ambientLight;
        /** @description the background color for the scene @type {{r: number, g: number, b: number, a: number}} */
        this.ambientBackgroundColor;

        /**
         * Lights information
         */

        /** @description all parsed lights @type {{Map.<string, (omniLights|spotLights)>}} */
        this.parsedLights;

        /**
         * Textures
         */

        /** @description all parsed textures @type {{Map.<string, CGFtexture>}} Maps each texture ID to filename */
        this.parsedTextures = new Map();

        /**
         * Materials
         */
        /** @description all parsed materials @type {{Map.<string, CGFappearance}} */
        this.parsedMaterials = new Map();
        
        /**
         * Transformations
         */

        /** @description all parsed transformations @type {Map.<string, Array.<parsedRotate | parsedScale | parsedTranslate>>} */
        this.parsedTransformations;

        /**
         * Primitives
         */
        /** @description all parsed primitives @type {Map.<string, (parsedRectangle | parsedTriangle | parsedCylinder | parsedSphere)>} */
        this.parsedPrimitives;

        /**
         * Components
         */
        this.parsedComponents;


        /**
         * File reading
         */
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
        let index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order");

            //Parse scene block
            let scene = new Scene(this);
            if(scene.parse(nodes[index]))
                return "Failed to parse the <scene> tag. ABORT!";
            else
                this.info('Parsed scene');
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <scene> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse scene block
            let views = new Views(this);
            if(views.parse(nodes[index]))
                return "Failed to parse the <views> tag. ABORT!";
            else {
                this.info('Parsed views');
                this.defaultView = views.getDefaultViewID();
                this.views = views.getParsedViews();
            }
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            let ambient = new Ambient(this);
            if(ambient.parse(nodes[index]))
                return "Failed to parse the <ambient> tag. ABORT!";
            else {
                this.info('Parsed ambient');
                this.ambientLight = ambient.getAmbientLight();
                this.ambientBackgroundColor = ambient.getBackground();
            }
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse ambient block
            let lights = new Lights(this);
            if(lights.parse(nodes[index]))
                return "Failed to parse the <lights> tag. ABORT!";
            else {
                this.parsedLights = lights.getParsedLights();
                this.info('Parsed lights');
            }
        }

        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse texture block
            let textures = new Textures(this);
            if(textures.parse(nodes[index])) 
                return "Failed to parse the <textures> tag. ABORT!";
            else {
                let parsedTextures = textures.getParsedTextures();
                // create the CFGtexture for each texture
                parsedTextures.forEach((value, key) => {
                    let cgfAppearance = new CGFtexture (this.scene, "scenes/images/"+value);
                    this.parsedTextures.set(key, cgfAppearance);
                });
                this.info('Parsed textures');
            }
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            let materials = new Materials(this);
            if(materials.parse(nodes[index])) {
                return "Failed to parse the <materials> tag"
            } else {
                let parsedMaterials = materials.getParsedMaterials();
                // create the CGFappearance for each material
                parsedMaterials.forEach((value, key) => {
                    let cgfAppearance = new CGFappearance(this.scene);
                    cgfAppearance.setAmbient(value.ambient.r, value.ambient.g, value.ambient.b, value.ambient.a);
                    cgfAppearance.setDiffuse(value.diffuse.r, value.diffuse.g, value.diffuse.b, value.diffuse.a);
                    cgfAppearance.setEmission(value.emission.r, value.emission.g, value.emission.b, value.emission.a);
                    cgfAppearance.setSpecular(value.specular.r, value.specular.g, value.specular.b, value.specular.a);
                    cgfAppearance.setShininess(value.shininess);
                    this.parsedMaterials.set(key, cgfAppearance);
                });
                this.info('Parsed materials');
            }
            
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse texture block
            let transformations = new Transformations(this);
            if(transformations.parse(nodes[index])) 
                return "Failed to parse the <transformations> tag. ABORT!";
            else {
                this.parsedTransformations = transformations.getParsedTransformations();
                this.info('Parsed transformations');
            }
        }


        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1) {
            return "tag <primitives> missing";

        } else {

            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");
            //Parse primitives block
            let primitives = new Primitives(this);
            
            if (primitives.parse(nodes[index]))
                return "Failed to parse the <primitives> tag. ABORT!";
            else {
                this.parsedPrimitives = primitives.getPrimitives();
                this.info('Parsed primitives');
            }
        }

        // >components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            let components = new ComponentsParser(this);
            if (components.parse(nodes[index]))
                return "Failed to parse the <transformations> tag. ABORT!";
            
            let aux = components.getParsedComponents();
            this.parsedComponents = new Map();
            aux.forEach((value, key) => {
                this.parsedComponents.set(key, new Component(this, this.scene, value));
            });
            console.log(components);
            this.info('Parsed components');
        }
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
        // Apply default material
        
        // entry point for graph rendering
        //TODO: Render loop starting at root of graph
        this.parsedComponents.get(this.idRoot).display();
    }
}