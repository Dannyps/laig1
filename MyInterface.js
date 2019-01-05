/**
 * MyInterface class, creating a GUI interface.
 */
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        return true;
    }

    /**
     * Setup key pressing support
     */

    initKeys() {
        this.scene.gui = this;
    }

    processKeyboard(event) {
        console.log(event);
        if (event.key === 'm' || event.key === 'M') {
            this.scene.updateMaterials = true;
        }
    }

    /**
     * Adds a folder containing the IDs of the lights passed as parameter.
     * @param {array} lights
     */
    addLightsGroup(lights) {
        let group = this.gui.addFolder("Lights");
        this.scene.graph.parsedLights.forEach((light, id) => {
            this.scene.lightValues[id] = light.enabled;
            group.add(this.scene.lightValues, id);
        });

    }

    addViewsGroup() {
        let viewsID = [];
        this.scene.views.forEach((value, id) => {
            viewsID.push(id);
        });

        let ctrl = this.gui.add(this.scene, 'activeCamera', viewsID);
        ctrl.onChange(function (val) {
            let oldCam = this.scene.camera;
            let newCam = this.scene.views.get(val);
            this.scene.animateCamera(oldCam, newCam);
        }.bind(this));

        // force to update view
        ctrl.setValue(this.scene.activeCamera);
    }

    addGameControl(gc) {

        let gg = this.gui.addFolder("Game Control");
        gg.open();
        let status = gg.add(gc, 'status', {
            'Starting': 0,
            'Waiting for Server': 1,
            'Running': 2,
            'Finished': 3
        }).listen();

        gg.add(gc, 'type', {
            'Player vs Player': 0,
            'Player vs Bot': 1,
            'Bot vs Bot': 2,
            'unset': -1
        }).onChange(val => {
            if (val == -1 || val == 0) {
                difficulty.domElement.childNodes[0].disabled = true;
            } else {
                difficulty.domElement.childNodes[0].disabled = false;
            }
        });

        let difficulty = gg.add(gc, 'difficulty', {
            'Low': 0,
            'Medium': 1,
            'High': 2,
            'unset': -1
        });
        let statusStr = gg.add(gc, 'statusStr').listen()
        
        gg.add(gc, 'undo');

        status.domElement.childNodes[0].disabled = true;
        difficulty.domElement.childNodes[0].disabled = true;
        statusStr.domElement.childNodes[0].disabled = true;

        // todo disable select
    }

}