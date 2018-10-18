'use strict';

/**
 * @typedef material
 * @type {object}
 * @property {number} shininess
 * @property {{r: number, g: number, b: number, a: number}} ambient
 * @property {{r: number, g: number, b: number, a: number}} diffuse
 * @property {{r: number, g: number, b: number, a: number}} specular
 * @property {{r: number, g: number, b: number, a: number}} emission
 */
class Materials extends GenericParser {
    constructor(sceneGraph) {
        super(sceneGraph);

        // set default values
        this.defaultShininess = 10;
        this.defaultEmission = {
            r: 0,
            g: 0,
            b: 0,
            a: 1
        };
        this.defaultAmbient = {
            r: 0.2,
            g: 0.2,
            b: 0.2,
            a: 1
        };
        this.defaultDiffuse = {
            r: 0.5,
            g: 0.5,
            b: 0.5,
            a: 1
        };
        this.defaultSpecular = {
            r: 0.5,
            g: 0.5,
            b: 0.5,
            a: 1
        };

        // data structure for all materials
        this.materials = new Map();
    }

	/**
	 * Returns all parsed materials from the <materials> element
	 * @return {Map.<string, material>} Returns a map where in each pair (key, value) the key is the material ID and the value are the set of properties
	 */
	getParsedMaterials() {	
		return this.materials;
	}

    /**
     * Parses all the <materials> node
     * @param {Element} materialsNode 
     * @return {Number} Returns 0 upon success, or -1 upon errors
     */
    parse(materialsNode) {
        let materialsCollection = materialsNode.getElementsByTagName('material');
        
        for(let matEl of materialsCollection) {
            if(this._parseMaterial(matEl))
            return -1; // failed to parse the material
        }

        // ensure at least one material is defined
        if (this.materials.size === 0) {
            this.onXMLError('You must set at least one material!');
            return -1;
        }

        return 0;
    }
    /**
     * 
     * @param {Element} matEl The <material> to parse 
     * @return {Number} Returns 0 upon success or minor errors, or any other value upon critical errors 
     */
    _parseMaterial(matEl) {
        if (matEl.tagName !== 'material') throw 'Unexpected element';

        /**
         * Parse the attributes for the material element
         */
        let attrs = this._parseAttributes(matEl, {
            id: 'ss',
            shininess: 'ff'
        }, {
            shininess: this.defaultShininess
        });

        if (attrs === null)
            return -1;// some error happened

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

        requiredElements.set('emission', {
            hasFallback: true,
            requiredAttrs: requiredAttrsLightComp,
            defaultValues: this.defaultEmission
        });

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

        let parsedElements = this._parseUniqueChildElements(matEl, requiredElements);

        // push the material data

        if (this.materials.get(attrs.id) != undefined) {
            this.onXMLMinorError("There are two materials with the same ID! Last will be used.");
        }

        this.materials.set(attrs.id, {
            shininess: attrs.shininess,
            ambient: parsedElements.get('ambient') || this.defaultAmbient,
            diffuse: parsedElements.get('diffuse') || this.defaultDiffuse,
            specular: parsedElements.get('specular') || this.defaultSpecular,
            emission: parsedElements.get('emission') || this.defaultEmission 
        });
    }

	/**
	 * 
	 * @param {string[]} matEl 
	 */
    parseMaterialRefs(matEl) {
        if (matEl.tagName !== 'materials') throw 'Unexpected element';

        let childrn = matEl.children;
        let mats = [];
        for (let i = 0; i < childrn.length; i++) {
            let mat = this._parseAttributes(childrn[i], {id: 'ss'});
            mats.push(mat);
        }

        return mats;
    }

}