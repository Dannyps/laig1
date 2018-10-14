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
            r: 0.2,
            g: 0.2,
            b: 0.2,
            a: 1
        };
    }

    /**
     * Returns the background color for the scene
     * @return {{r: number, g: number, b: number, a: number}}
     */
    getBackground() {
        return this.backgroundScene;
    }

    /**
     * Returns the ambient light for the scene
     * @return {{r: number, g: number, b: number, a: number}}
     */
    getAmbientLight() {
        return this.ambientLight;
    }

    /**
     * Parses the ambient element from XML
     * @param {Element} ambientNode 
     * @return {null}
     */
    parse(ambientNode) {
        // specify the required elements and call auxiliary method to parse them
        let requiredElements = new Map();
        
        requiredElements.set('ambient', {
            hasFallback: true,
            requiredAttrs: {r: 'ff', g: 'ff', b: 'ff', a: 'ff'},
            defaultValues: this.ambientLight
        });

        requiredElements.set('background', {
            hasFallback: true,
            requiredAttrs: {r: 'ff', g: 'ff', b: 'ff', a: 'ff'},
            defaultValues: this.backgroundScene
        });

        let parsedElements = this._parseUniqueChildElements(ambientNode, requiredElements);

        // update internal values with parsed values, if they exist
        if(parsedElements.has('ambient')) {
            this.ambientLight = parsedElements.get('ambient');
        }

        if(parsedElements.has('background')) {
            this.backgroundScene = parsedElements.get('background');
        }

        return null; // the errors are handled with fallback values
    }
}