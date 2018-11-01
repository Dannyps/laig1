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

        /**
         * Cameras
         */
        this.activeCamera; // holds the ID of the active camera
        this.views = new Map(); // maps the ID to a CFGCamera or CGFCameraOrtho
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15,15,15), vec3.fromValues(0,0,0)); // the LIB requires this...

        /**
         * Lights. The scene has an array of CGFlights, and an object to be used by the interface. 
         * These two are related. The first property in lightValues is related to the first CGFlight in the array
         */

        /** @description Array of CGFLights to be used on the scene @type {CGFlight[]} */
        this.lights;

        /** @description Object to be manipulated by the interface to turn lights on/off  @type {{id: boolean}} */
        this.lightValues = {};

        /** @description Flag to tell wether the materials should change or not in the next scene rendering @type {boolean} */
        this.updateMaterials;

        /** @description Holds the current system time and it's updated aproximatelly every ~100ms in update() callback */
        this.currSysTime;
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

        this.setUpdatePeriod(100); // every ~100 ms call updateTime callback
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
            } else if(view.type === 'ortho') {
                this.views.set(id, new CGFcameraOrtho(
                    view.left, view.right, view.bottom, view.top, view.near, view.far, 
                    vec3.fromValues(view.from.x, view.from.y, view.from.z), 
                    vec3.fromValues(view.to.x, view.to.y, view.to.z), vec3.fromValues(0,1,0))
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
        let i = 0;

        this.graph.parsedLights.forEach((light, id) => {
            this.lights[i].setPosition(light.location.x, light.location.y, light.location.z, light.location.w);
            this.lights[i].setAmbient(light.ambient.r, light.ambient.g, light.ambient.b, light.ambient.a);
            this.lights[i].setDiffuse(light.diffuse.r, light.diffuse.g, light.diffuse.b, light.diffuse.a);
            this.lights[i].setSpecular(light.specular.r, light.specular.g, light.specular.b, light.specular.a);
            this.lights[i].setVisible(true);

            if(light.enabled) 
                this.lights[i].enable(); 
            else 
                this.lights[i].disable();

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
        let background =  this.graph.ambientBackgroundColor;
        this.gl.clearColor(background.r, background.g, background.b, background.a);

        let ambLight = this.graph.ambientLight;
        this.setGlobalAmbientLight(ambLight.r, ambLight.g, ambLight.b, ambLight.a);

        // initialize lights
        this.initLights();

        // Adds lights group.
        this.interface.addLightsGroup(this.graph.parsedLights);

        // Add support for keys
        this.interface.initKeys();

        this.sceneInited = true;
    }

    /**
     * Callback invoked with some frequency specified with this.setUpdatePeriod()
     * @param {*} currTime 
     */
    update(currTime) {
        this.currSysTime = currTime;  // current system time in miliseconds

        this.graph.parsedAnimations.forEach((anim) => {
            anim.update(this.currSysTime);
        });
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

            // turn lights on/off
            let i = 0;
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

            if(this.updateMaterials) {
                console.log("Update the materials");
            }

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();

            // set the flag to false
            this.updateMaterials = false;
        }
        else {
            // Draw axis
            this.axis.display();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}