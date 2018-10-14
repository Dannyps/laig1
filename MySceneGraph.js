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

        /** @description all parsed textures @type {{Map.<string, string>}} Maps each texture ID to filename */
        this.textures;

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
                this.textures = textures.getParsedTextures();
                this.info('Parsed textures');
            }
        }

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
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            this.parsedPrimitives = new Primitives(this);
            if((error = this.parsedPrimitives.parse(nodes[index])) !== null)
                return error;

            this.info('Parsed primitives');
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
                        x:primitive.x1, y:primitive.y1, z:primitive.z1
                    }, {
                        x:primitive.x2, y:primitive.y2, z:primitive.z2
                    }, {
                        x:primitive.x3, y:primitive.y3, z:primitive.z3
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
        });
    }
}