'use strict';

class Materials extends GenericParser{
    constructor(sceneGraph) {
        super(sceneGraph);

        // set default values
        this.shininess = 1;
        this.emission = {x: 0, y:0, z: 0, w: 0};
        this.ambient = {r: 0.5, g: 0.5, b: 0.5, a: 1};
        this.diffuse = {r: 0.3, g: 0.3, b: 0.3, a: 1};
        this.specular = {r: 0.2, g: 0.2, b: 0.2, a: 1};

        this.materials = new Map();
    }

    parse(materialsNode) {
        let materialsCollection = materialsNode.getElementsByTagName('material');
        Array.prototype.forEach.call(materialsCollection, (matEl) => {
            this._parseMaterial(matEl);
        });

        // ensure at least one material is defined
        if(this.materials.size === 0) {
            this.onXMLError('You must set at least one material!');
            return -1;
        }
    }

    _parseMaterial(matEl) {
        if(matEl.tagName !== 'material') throw 'Unexpected element';

        /**
         * Parse the attributes for the material element
         */
        let attrs = this._parseAttributes(matEl, {id: 'ss', shininess: 'ff'}, {enabled: true});

        if(attrs === null) {
            // some error happened
            return;
        }

        /**
         * Setup the parser for child elements
         */
        let requiredElements = new Map();
        let requiredAttrsLightComp = {r: 'ff', g:'ff', b:'ff', a:'ff'};
        
        requiredElements.set('emission', {
            hasFallback: true,
            requiredAttrs: requiredAttrsLightComp,
            defaultValues: this.ambient
        });

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

        let parsedElements = this._parseUniqueChildElements(matEl, requiredElements);

        // push the material data

        if (this.materials.get(attrs.id) != undefined) {
            this.onXMLError("There are two materials with the same ID! Last will be used.");
        }

        this.materials.set(attrs.id, {
            shininess: attrs.shininess,
            ambient: parsedElements.get('ambient'),
            diffuse: parsedElements.get('diffuse'),
            specular: parsedElements.get('specular'),
            emission: parsedElements.get('emission')
        });
    }

}