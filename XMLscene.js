var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;

        this.lightValues = {};

        /**
         * Cameras
         */
        this.activeCamera; // holds the ID of the active camera
        this.views = new Map(); // maps the ID to a CFGCamera or CGFCameraOrtho
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15,15,15), vec3.fromValues(0,0,0)); // the LIB requires this...
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.graph.views.forEach((view, id) => {
            if(view.type === 'perspective') {
                this.views.set(id, new CGFcamera(
                    view.fieldView, view.near, view.far, 
                    vec3.fromValues(view.from.x, view.from.y, view.from.z), 
                    vec3.fromValues(view.to.x, view.to.y, view.to.z))
                );
            }
        });

        // set the default camera
        this.activeCamera = this.graph.defaultView;

        // loads the camera's ID to the interface
        this.interface.addViewsGroup();
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        /*
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                //lights are predefined in cgfscene
                this.lights[i].setPosition(light[1][0], light[1][1], light[1][2], light[1][3]);
                this.lights[i].setAmbient(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setDiffuse(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setSpecular(light[4][0], light[4][1], light[4][2], light[4][3]);

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }*/
        let i = 0;
        this.graph.parsedLights.omniLights.forEach((omniLight, id) => {
            this.lights[i].setPosition(omniLight.location.x, omniLight.location.y, omniLight.location.z, omniLight.location.w);
            this.lights[i].setAmbient(omniLight.ambient.r, omniLight.ambient.g, omniLight.ambient.b, omniLight.ambient.a);
            this.lights[i].setDiffuse(omniLight.diffuse.r, omniLight.diffuse.g, omniLight.diffuse.b, omniLight.diffuse.a);
            this.lights[i].setSpecular(omniLight.specular.r, omniLight.specular.g, omniLight.specular.b, omniLight.specular.a);
            this.lights[i].setVisible(true);

            if(omniLight.enabled) this.lights[i].enable(); 
            else this.lights[i].disable();

            i++;
        });

        this.graph.parsedLights.spotLights.forEach((sL, id) => {
            this.lights[i].setPosition(sL.location.x, sL.location.y, sL.location.z, sL.location.w);
            this.lights[i].setAmbient(sL.ambient.r, sL.ambient.g, sL.ambient.b, sL.ambient.a);
            this.lights[i].setDiffuse(sL.diffuse.r, sL.diffuse.g, sL.diffuse.b, sL.diffuse.a);
            this.lights[i].setSpecular(sL.specular.r, sL.specular.g, sL.specular.b, sL.specular.a);
            this.lights[i].setSpotDirection(sL.target.x, sL.target.y, sL.target.z);
            this.lights[i].setSpotCutOff(sL.angle);
            this.lights[i].setSpotExponent(sL.exponent);
            
            this.lights[i].setVisible(true);

            if(sL.enabled) this.lights[i].enable(); 
            else this.lights[i].disable();
            i++;
        });
    }


    /* Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        // Change reference length according to parsed graph
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        // Init cameras
        this.initCameras();

        // Change ambient and background details according to parsed graph
        let background =  this.graph.ambient.getBackground();
        this.gl.clearColor(background.r, background.g, background.b, background.a);

        let ambLight = this.graph.ambient.getAmbientLight();
        this.setGlobalAmbientLight(ambLight.r, ambLight.g, ambLight.b, ambLight.a);

        this.initLights();

        // Adds lights group.
        this.interface.addLightsGroup(this.graph.parsedLights);

        this.sceneInited = true;
    }


    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        if (this.sceneInited) {
            // Draw axis
            this.axis.display();

            var i = 0;
            for (var key in this.lightValues) {
                if (this.lightValues.hasOwnProperty(key)) {
                    if (this.lightValues[key]) {
                        this.lights[i].setVisible(true);
                        this.lights[i].enable();
                    }
                    else {
                        this.lights[i].setVisible(false);
                        this.lights[i].disable();
                    }
                    this.lights[i].update();
                    i++;
                }
            }

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }
        else {
            // Draw axis
            this.axis.display();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}