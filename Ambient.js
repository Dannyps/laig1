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

        if(background === null) {
            this.sceneGraph.onXMLMinorError("element <ambient>/<background> not set. Using default background");
        } else {
            this._parseChilds(background);
        }

        if(ambient == null) {
            this.sceneGraph.onXMLMinorError("element <ambient>/<background> not set. Using default background");
        } else {
            this._parseChilds(ambient);
        }

        this.sceneGraph.info("Parsed ambient");

        return null; // the errors are handled with fallback values
    }

    /**
     * Parses the child nodes of <ambient> tag
     * @param {Element} ambientNode 
     */
    _parseChilds(childElement) {
        // aux references the internal structure to update, already initialized with default values
        let aux;

        // determine the type of child to parse
        if(childElement.tagName === 'ambient') this.ambientLight = this._parseAttributes(childElement, {r: 'ff', g: 'ff', b: 'ff', a: 'ff', teste: 'ii'}, this.backgroundScene);
        else if(childElement.tagName === 'background') this.backgroundScene =  this._parseAttributes(childElement, {r: 'ff', g: 'ff', b: 'ff', a: 'ff', teste:'ii'}, this.backgroundScene);
        else throw 'Unexpected ambient child element to parse';

        /*
        // the required attributes
        let requiredAttrsNames = ['r', 'g', 'b', 'a'];
        
        requiredAttrsNames.forEach(attrName => {
            // check if required attribute exists
            if(childElement.hasAttribute(attrName)) {
                // attempt to parse. All attribute values must be float. If it's not a valid float, attrValue = NaN
                let attrValue = Number.parseFloat(childElement.getAttribute(attrName));

                if (isNaN(attrValue))
                    this.sceneGraph.onXMLMinorError(`Attribute ${attrName} for ${childElement.tagName} should be float type, using fallback value`);
                else
                    aux[attrName] = attrValue;

            } else {
                this.sceneGraph.onXMLMinorError(`Attribute ${attrName} for ${childElement.tagName} ambient light is not set, using fallback value`);
            }
        });
        */
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