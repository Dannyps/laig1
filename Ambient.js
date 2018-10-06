'use strict';

class Ambient extends GenericParser {
    /**
     * Constructor
     * @param {*} sceneGraph 
     */
    constructor(sceneGraph) {
        super(sceneGraph);

        // default for background color
        this.backgroundScene = {
            r: 0.5,
            g: 0.5,
            b: 0.5,
            a: 1
        };

        // default ambient light
        this.ambientLight = {
            r: 0.5,
            g: 0.5,
            b: 0.5,
            a: 1
        };
    }

    /**
     * Parses the ambient element from XML
     * @param {Element} ambientNode 
     * @return {null}
     */
    parse(ambientNode) {
        // find ambient child element
        let ambientCollection = ambientNode.getElementsByTagName('ambient');
        if (ambientCollection.length === 0) {
            this.sceneGraph.onXMLMinorError("[AMBIENT]: Tag <ambient> is not set. Using default values");
        } else {
            if(ambientCollection.length > 1) 
                this.sceneGraph.onXMLMinorError("[AMBIENT]: Tag <ambient> defined multiple times. Using first definition.");

            // parse attributes
            this.ambientLight = this._parseAttributes(ambientCollection[0], {r: 'ff', g: 'ff', b: 'ff', a: 'ff'}, this.ambientLight);
        }  

        // find background child element
        let backgroundCollection = ambientNode.getElementsByTagName('background');
        if (backgroundCollection.length === 0) {
            this.sceneGraph.onXMLMinorError("[AMBIENT]: Tag <background> is not set. Using default values");
        } else {
            if(backgroundCollection.length > 1) 
                this.sceneGraph.onXMLMinorError("[AMBIENT]: Tag <background> defined multiple times. Using first definition.");
            
            // parse attributes
            this.backgroundScene = this._parseAttributes(backgroundCollection[0], {r: 'ff', g: 'ff', b: 'ff', a: 'ff'}, this.backgroundScene);
        }

        // declare that ambient was parsed
        this.sceneGraph.info("Parsed ambient");

        return null; // the errors are handled with fallback values
    }

    /**
     * Returns the background color for the scene
     * @return {Object} {r: NUMBER, g: NUMBER, b: NUMBER, a: NUMBER}
     */
    getBackground() {
        return this.backgroundScene;
    }

    /**
     * Returns the ambient light for the scene
     * @return {Object} {r: NUMBER, g: NUMBER, b: NUMBER, a: NUMBER}
     */
    getAmbientLight() {
        return this.ambientLight;
    }
}