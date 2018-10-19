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
        this.scene.gui=this;
    }
    
    processKeyboard(event) {
        console.log(event);
        if(event.key === 'm' || event.key === 'M') {
            this.scene.updateMaterials = true;
        }
    }

    /**
     * Adds a folder containing the IDs of the lights passed as parameter.
     * @param {array} lights
     */
    addLightsGroup(lights) {
        let group = this.gui.addFolder("Lights");
        group.open();

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
        ctrl.onChange(function(val) {
            this.scene.camera = this.scene.views.get(val);
            this.setActiveCamera(this.scene.camera);    
        }.bind(this));

        // force to update view
        ctrl.setValue(this.scene.activeCamera);
    }
}