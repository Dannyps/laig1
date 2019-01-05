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
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0)); // the LIB requires this...

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

        this.lastRegisteredPickId = 1;

        this.gameBoard;

        this.lastRegisteredSpotID = 1000;
        this.lastRegisteredPieceID = 2000;
    }

    /**
     * Returns a new unique register pick id
     * @deprecated
     */
    myRegisterForPick(obj, prefix = 0) {
        this.registerForPick(prefix + this.lastRegisteredPickId++, obj);
    }

    /**
     * Registers a BoardSpot for picking. Each BoardSpot has a unique id starting from 1000
     * @param {BoardSpot} obj 
     */
    registerSpotForPick(obj) {
        this.registerForPick(this.lastRegisteredSpotID++, obj);
    }

    /**
     * Registers a MyPiece for picking. Each Piece has an unique id starting from 2000
     * @param {MyPiece} obj 
     */
    registerPieceForPick(obj) {
        this.registerForPick(this.lastRegisteredPieceID++, obj);
    }

    /**
     * calculate incremented value
     * @param {float} ov olf value
     * @param {float} nv new value
     */
    civ(ov, nv, i, steps) {
        let res = ov + ((nv - ov) / steps) * (i / 5);
        return res;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async animateCamera(oldC, newC) {
        //debugger;
        let steps = 60;
        for (let i = 0; i < steps; i++) {
            this.camera.position[0] = this.civ(oldC.position[0], newC.position[0], i, steps);
            this.camera.position[1] = this.civ(oldC.position[1], newC.position[1], i, steps);
            this.camera.position[2] = this.civ(oldC.position[2], newC.position[2], i, steps);

            this.camera.target[0] = this.civ(oldC.target[0], newC.target[0], i, steps);
            this.camera.target[1] = this.civ(oldC.target[1], newC.target[1], i, steps);
            this.camera.target[2] = this.civ(oldC.target[2], newC.target[2], i, steps);

            this.camera._up[0] = this.civ(oldC._up[0], newC._up[0], i, steps);
            this.camera._up[1] = this.civ(oldC._up[1], newC._up[1], i, steps);
            this.camera._up[2] = this.civ(oldC._up[2], newC._up[2], i, steps);

            this.camera.fov = this.civ(oldC.fov, newC.fov, i, steps);

            this.interface.setActiveCamera(this.camera);
            await this.sleep(500 / steps);
        }
        //debugger;
        this.camera = newC;
        this.interface.setActiveCamera(this.camera);

        this.loadViews();
    }
    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.enableTextures(true);

        this.gl.clearColor(0, 0, 0, 1.0);
        this.gl.clearDepth(10000.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);

        this.setUpdatePeriod(10); // every ~100 ms call updateTime callback
        this.setPickEnabled(true);
    }


    loadViews() {
        this.graph.views.forEach((view, id) => {
            if (view.type === 'perspective') {
                this.views.set(id, new CGFcamera(
                    view.fieldView, view.near, view.far,
                    vec3.fromValues(view.from.x, view.from.y, view.from.z),
                    vec3.fromValues(view.to.x, view.to.y, view.to.z)));
            } else if (view.type === 'ortho') {
                this.views.set(id, new CGFcameraOrtho(
                    view.left, view.right, view.bottom, view.top, view.near, view.far,
                    vec3.fromValues(view.from.x, view.from.y, view.from.z),
                    vec3.fromValues(view.to.x, view.to.y, view.to.z), vec3.fromValues(0, 1, 0)));
            }
        });
    }
    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.loadViews();

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

            if (light.enabled)
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
        let background = this.graph.ambientBackgroundColor;
        this.gl.clearColor(background.r, background.g, background.b, background.a);

        let ambLight = this.graph.ambientLight;
        this.setGlobalAmbientLight(ambLight.r, ambLight.g, ambLight.b, ambLight.a);

        // initialize lights
        this.initLights();

        // Adds lights group.
        this.interface.addLightsGroup(this.graph.parsedLights);

        // Add support for keys
        this.interface.initKeys();

        this.gc = {
            status: 0,
            type: -1,
            statusStr: "Loading...",
            difficulty: -1,
            undo: function(){
                // todo
                alert("replace me with real code");
            }
        };

        this.interface.addGameControl(this.gc);

        this.sceneInited = true;

        setTimeout(() => {
            // Create board
            this.gameBoardCGFObj = this.graph.parsedComponents.get('gameBoard').CGFprimitives.get('board');
            this.game = new KnightLine(this);
            this.game.dummy_handshake();

        }, 1500);

    }

    /**
     * Callback invoked with some frequency specified with this.setUpdatePeriod()
     * @param {*} currTime 
     */
    update(currTime) {
        this.currSysTime = currTime; // current system time in miliseconds
    }

    logPicking() {
        if (this.pickResults != null && this.pickResults.length > 0) {
            for (var i = 0; i < this.pickResults.length; i++) {
                var obj = this.pickResults[i][0];
                if (obj) {
                    var customId = this.pickResults[i][1];
                    console.log("Picked object: " + obj + ", with pick id " + customId);
                }
            }
            this.pickResults.splice(0, this.pickResults.length);
        }
    }

    /**
     * Displays the scene.
     */
    display() {
        if (this.gameBoardCGFObj)
            this.gameBoardCGFObj.updateState();
        // display log
        this.logPicking();
        this.clearPickRegistration();
        this.lastRegisteredPickId = 1; // reset
        this.lastRegisteredSpotID = 1000;
        this.lastRegisteredPieceID = 2000;
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.canvas.addEventListener('wheel', function (event) {
            if (event.shiftKey) console.log(event);
            return false;
        });

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
                    } else {
                        this.lights[i].setVisible(false);
                        this.lights[i].disable();
                    }
                    this.lights[i].update();
                    i++;
                }
            }

            if (this.updateMaterials) {
                console.log("Update the materials");
            }

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();

            // set the flag to false
            this.updateMaterials = false;
        } else {
            // Draw axis
            this.axis.display();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}