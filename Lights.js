'use strict';

class Lights extends GenericParser{
    constructor(sceneGraph) {
        super(sceneGraph);

        // set default values
        this.enabled = true;
        this.location = {x: 0, y:0, z: 0, w: 0};
        this.ambient = {r: 0.5, g: 0.5, b: 0.5, a: 1};
        this.diffuse = {r: 0.3, g: 0.3, b: 0.3, a: 1};
        this.specular = {r: 0.2, g: 0.2, b: 0.2, a: 1};

        // data structure for omni and spot light types
        this.omniLights = new Map();
        this.spotLights = new Map();
    }

    parse(lightsNode) {
        // find all omni elements and parse them
        let omniCollection = lightsNode.getElementsByTagName('omni');
        Array.prototype.forEach.call(omniCollection, (omniEl) => {
            this._parseOmniLights(omniEl);
        });

        // find all spot elements and parse them
        // TODO

        // ensure at least one light is defined
        if(this.omniLights.size + this.spotLights.size === 0) {
            this.onXMLError('You must set at least one light!');
            return -1;
        }
    }

    _parseOmniLights(omniEl) {
        if(omniEl.tagName !== 'omni') throw 'Unexpected element';

        /**
         * Parse the attributes for the omni element
         */
        let attrs = this._parseAttributes(omniEl, {id: 'ss', enabled: 'tt'}, {enabled: true});

        if(attrs === null) {
            // some error happened, skip this omni light
            return;
        }

        /**
         * Setup the parser for child elements
         */
        let requiredElements = new Map();
        let requiredAttrsLightComp = {r: 'ff', g:'ff', b:'ff', a:'ff'};
        
        requiredElements.set('ambient', {
            hasFallback: true,
            requiredAttrs: requiredAttrsLightComp,
            defaultValues: this.ambient
        });

        requiredElements.set('diffuse', {
            hasFallback: true,
            requiredAttrs: requiredAttrsLightComp,
            defaultValues: this.diffuse
        });

        requiredElements.set('specular', {
            hasFallback: true,
            requiredAttrs: requiredAttrsLightComp,
            defaultValues: this.specular
        });

        requiredElements.set('location', {
            hasFallback: true,
            requiredAttrs: {x: 'ff', y: 'ff', z: 'ff', w: 'ff'},
            defaultValues: this.location
        });


        let parsedElements = this._parseUniqueChildElements(omniEl, requiredElements);

        // push the omni data
        this.omniLights.set(attrs.id, {
            enabled: attrs.enabled,
            ambient: parsedElements.get('ambient'),
            diffuse: parsedElements.get('diffuse'),
            specular: parsedElements.get('specular'),
            location: parsedElements.get('location')
        });
    }

    setLights() {
        
    }
}