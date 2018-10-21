'use strict';

/**
 * @typedef omniLights
 * @type {Object}
 * @property {string} type - "omni"
 * @property {boolean} enabled - if the light starts on/off
 * @property {{r: number, g: number, b: number, a: number}} ambient - ambient component
 * @property {{r: number, g: number, b: number, a: number}} diffuse - diffuse component
 * @property {{r: number, g: number, b: number, a: number}} specular - specular component
 * @property {{x: number, y: number, z: number, w: number}} location - the light position
 */

 /**
  * @typedef spotLights
  * @type {Object}
  * @property {string} type - "spot"
  * @property {boolean} enabled - if the light starts on/off
  * @property {number} exponent
  * @property {number} angle
  * @property {{r: number, g: number, b: number, a: number}} ambient - ambient component
  * @property {{r: number, g: number, b: number, a: number}} diffuse - diffuse component
  * @property {{r: number, g: number, b: number, a: number}} specular - specular component
  * @property {{x: number, y: number, z: number, w: number}} location - the light position
  * @property {{x: number, y: number, z: number}} target
  */


class Lights extends GenericParser {
    
    /**
     * Parser for light components
     * @param {*} sceneGraph 
     */
    constructor(sceneGraph) {
        super(sceneGraph);

        /** data structure for omni and spot light types @type {Map.<string, (omniLights|spotLights)>} */
        this.parsedLights = new Map();

        // default values
        this.defaultEnabled = true;
        this.defaultLocation = {x: 0, y: 0, z: 0, w: 1};
        this.defaultTarget =  {x: 5, y: 5, z: 5};
        this.defaultAmbient = {r: 0.15, g: 0.15, b: 0.15, a: 1};
        this.defaultDiffuse = {r: 0.3, g: 0.3, b: 0.3, a: 1};
        this.defaultSpecular = {r: 0.2, g: 0.2, b: 0.2, a: 1};
    }

    /**
     * @return {Map.<string, (omniLights|spotLights)>} Returns all valid parsed lights
     */
    getParsedLights() {
        return this.parsedLights;
    }

    /**
     * Parses all lights
     * @param {Element} lightsNode The <lights> element to be parsed
     * @return {number} Returns 0 upon success, or any other value otherwise
     */
    parse(lightsNode) {
        // find all omni elements and parse them
        let omniCollection = lightsNode.getElementsByTagName('omni');
        Array.prototype.forEach.call(omniCollection, (omniEl) => {
            this._parseOmniLights(omniEl);
        });

        // find all spot elements and parse them
        let spotCollection = lightsNode.getElementsByTagName('spot');
        Array.prototype.forEach.call(spotCollection, (spotEl) => {
            this._parseSpotLights(spotEl);
        });

        // ensure at least one light is defined
        if (this.parsedLights.size === 0) {
            this.onXMLError('You must set at least one light!');
            return -1;
        }

        // ensure there aren't more than 8 lights
        if (this.parsedLights.size > 8) {
            this.onXMLError('There can\'t be more than 8 lights!');
            return -1;
        }

        return 0;
    }

    /**
     * Parses <omni> elements and pushes the properties of this light to {@link Lights#parsedLights} map.
     * If some error happens while parsing attributes/child elements, a message is displayed and the element is skipped
     * It also ensures that if some previous parsed light has the same ID as this light, it displays a warning and it's skipped
     * 
     * @param {Element} omniEl 
     */
    _parseOmniLights(omniEl) {
        if (omniEl.tagName !== 'omni') throw 'Unexpected element';

        /**
         * Parse the attributes for the omni element
         */
        let attrs = this._parseAttributes(omniEl, {id: 'ss',enabled: 'tt'}, {enabled: this.defaultEnabled});

        if (attrs === null)
            return; // some error happened, skip this omni light

        // ensure ID uniqueness
        if(this.parsedLights.has(attrs.id)) {
            this.onXMLMinorError(`A light with id: ${attrs.id} already exists, thus this light will be ignored`);
        }

        /**
         * Setup the parser for child elements
         */
        let requiredElements = new Map();
        let requiredAttrsLightComp = {
            r: 'ff',
            g: 'ff',
            b: 'ff',
            a: 'ff'
        };

        requiredElements.set('ambient', {
            hasFallback: true,
            requiredAttrs: requiredAttrsLightComp,
            defaultValues: this.defaultAmbient
        });

        requiredElements.set('diffuse', {
            hasFallback: true,
            requiredAttrs: requiredAttrsLightComp,
            defaultValues: this.defaultDiffuse
        });

        requiredElements.set('specular', {
            hasFallback: true,
            requiredAttrs: requiredAttrsLightComp,
            defaultValues: this.defaultSpecular
        });

        requiredElements.set('location', {
            hasFallback: true,
            requiredAttrs: {
                x: 'ff',
                y: 'ff',
                z: 'ff',
                w: 'ff'
            },
            defaultValues: this.defaultLocation
        });

        let parsedElements = this._parseUniqueChildElements(omniEl, requiredElements);

        // push the omni data
        this.parsedLights.set(attrs.id, {
            type: 'omni',
            enabled: attrs.enabled,
            ambient: parsedElements.get('ambient'),
            diffuse: parsedElements.get('diffuse'),
            specular: parsedElements.get('specular'),
            location: parsedElements.get('location')
        });
    }

    /**
     * Parses <spot> elements and pushes the properties of this light to {@link Lights#parsedLights} map.
     * If some error happens while parsing attributes/child elements, a message is displayed and the element is skipped
     * It also ensures that if some previous parsed light has the same ID as this light, it displays a warning and it's skipped
     * 
     * @param {Element} omniEl 
     */
    _parseSpotLights(spotEL) {
        if (spotEL.tagName !== 'spot') throw 'Unexpected element';

        /**
         * Parse the attributes for the omni element
         */
        let attrs = this._parseAttributes(spotEL, {
            id: 'ss',
            enabled: 'tt',
            angle: 'ff',
            exponent: 'ff'
        }, {
            enabled: this.defaultEnabled,
            angle: 45,
            exponent: 2
        });

        if (attrs === null)
            return; // some error happened, skip this spot light

        // ensure ID uniqueness
        if(this.parsedLights.has(attrs.id)) {
            this.onXMLMinorError(`A light with id: ${attrs.id} already exists, thus this light will be ignored`);
        }

        /**
         * Setup the parser for child elements
         */
        let requiredElements = new Map();
        let requiredAttrsLightComp = {
            r: 'ff',
            g: 'ff',
            b: 'ff',
            a: 'ff'
        };

        requiredElements.set('ambient', {
            hasFallback: true,
            requiredAttrs: requiredAttrsLightComp,
            defaultValues: this.defaultAmbient
        });

        requiredElements.set('diffuse', {
            hasFallback: true,
            requiredAttrs: requiredAttrsLightComp,
            defaultValues: this.defaultDiffuse
        });

        requiredElements.set('specular', {
            hasFallback: true,
            requiredAttrs: requiredAttrsLightComp,
            defaultValues: this.defaultSpecular
        });

        requiredElements.set('location', {
            hasFallback: true,
            requiredAttrs: {
                x: 'ff',
                y: 'ff',
                z: 'ff',
                w: 'ff'
            },
            defaultValues: this.defaultLocation
        });

        requiredElements.set('target', {
            hasFallback: true,
            requiredAttrs: {
                x: 'ff',
                y: 'ff',
                z: 'ff'
            },
            defaultValues: this.defaultTarget
        });

        let parsedElements = this._parseUniqueChildElements(spotEL, requiredElements);

        // push the spot data
        this.parsedLights.set(attrs.id, {
            type: 'spot',
            enabled: attrs.enabled,
            exponent: attrs.exponent,
            angle: attrs.angle,
            ambient: parsedElements.get('ambient'),
            diffuse: parsedElements.get('diffuse'),
            specular: parsedElements.get('specular'),
            location: parsedElements.get('location'),
            target: parsedElements.get('target')
        });
    }

}