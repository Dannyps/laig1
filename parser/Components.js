'use strict';

/**
 * @typedef component
 * @type {object}
 * @property {(parsedRotate | parsedScale | parsedTranslate)[]} transformation - Array of transformations. Might be empty if it hasn't own transformations 
 * @property children:
 * @property primitivesID: string[];
 * @property componentsID: string[];
 * @property materials: any;
 * @property texture: any;
 */
class ComponentsParser extends GenericParser {
    /**
     * Parser for <components> tag
     * @param {*} sceneGraph 
     */
    constructor(sceneGraph) {
        super(sceneGraph);

        // data structure for components
        this.components = new Map();
    }

    getParsedComponents() {
        return this.components;
    }

    /**
     * Parses all components
     * @param {Element} componentsNode 
     * @return {number} Returns -1 if no components are defined, 0 otherwise
     */
    parse(componentsNode) {
        // find all component elements and parse them
        let componentsCollection = componentsNode.getElementsByTagName('component');
        Array.prototype.forEach.call(componentsCollection, (compEl) => {
            this._parseComponents(compEl);
        });

        // ensure at least one component is defined
        if (this.components.size === 0) {
            this.onXMLError('You must set at least one component!');
            return -1;
        }

        return 0;
    }

    /**
     * Parses the component and adds it to {@link ComponentsParser#components}
     * 
     * @param {*} compEl  
     */
    _parseComponents(compEl) {
        if (compEl.tagName !== 'component') throw 'Unexpected element';

        /**
         * Parse the attributes for the component
         */
        let attrs = this._parseAttributes(compEl, {id: 'ss',});

        if (attrs === null)
            return; // some error happened, skip this component

        /**
         * Parse child elements, without forcing any specific order
         */
        let parsedElements = {};

        for (let i = 0; i < compEl.children.length; i++) {
            switch (compEl.children[i].tagName) {
                case 'transformation':
                    parsedElements.transformation = this._parseTransformation(compEl.children[i]);
                    break;
                case 'children':
                    parsedElements.children = this._parseChildren(compEl.children[i]);
                    break;
                case 'materials':
                    parsedElements.materials = this._parseMaterials(compEl.children[i]);
                    break;
                case 'texture':
                    parsedElements.texture = this._parseTexture(compEl.children[i]);
                    break;
            }
        }

        this.components.set(attrs.id, parsedElements);
    }

    /**
     * Parses the transformation section of some component, which might be a reference or an inline transformation
     * @param {*} transformationEl 
     * @return {(null | parsedRotate | parsedScale | parsedTranslate)} Returns null upon errors or the transformation
     */
    _parseTransformation(transformationEl) {
        if (transformationEl.tagName != 'transformation') throw "Unexpected element";

        /**
         * Try to find a transformationref child element
         * It should be an unique child element
         * It must have an ID for an already parsed transformation
         */
        let transfRef = transformationEl.getElementsByTagName('transformationref');
        if (transfRef.length > 0) {
            // get the id
            let attrs = this._parseAttributes(transfRef[0], {id: 'ss'});
            if (attrs === null)
                return null; // id is not specified
            else if (!this.sceneGraph.parsedTransformations.has(attrs.id))
                return null; // there's no transformation with such id

            // final check, if multiple transformationref are defined, use the first one and show a warning
            if (transfRef.length > 1)
                this.onXMLMinorError("You can only set a single transformationref. Using the first one!");

            let trans = this.sceneGraph.parsedTransformations.get(attrs.id);
            if(trans === -1) return null; // failed to parse a transformation
            else return trans;
        }

        /**
         * No transformationref is declared, thus assume all child elements are transformation instructions
         */
        let transformations = new Transformations(this);
        return transformations._parseTransformations(transformationEl, false);
    }

    /** */
    _parseMaterials(materialsNode) {
        let materials = new Materials(this);
        return materials.parseMaterialRefs(materialsNode);
    }

    /** */
    _parseTexture(textureNode) {
        let textures = new Textures(this);
        return textures.parseTextRef(textureNode);
    }


    /**
     * Parses the children tag and returns an array of components IDs and primitives IDs. 
     * It doesn't verify that the ID's are correct (the elements exist), but ensures at least one child is defined and the syntax is correct
     * @param {Element} childrenEl 
     * @returns {({primitivesID: string[], componentsID: string[]}|null)} All successfully parsed children's ID or null upon errors
     */
    _parseChildren(childrenEl) {
        if (childrenEl.tagName != 'children') throw "Unexpected element";

        let componentRefs = [],
            primitiveRefs = [];

        Array.prototype.forEach.call(childrenEl.children, (el) => {
            if (!['componentref', 'primitiveref'].includes(el.tagName)) {
                this.onXMLMinorError(`Unknown element <${el.tagName}>`);
                return null; // skip
            }

            // parse ID attribute
            let attrs = this._parseAttributes(el, {id: 'ss'});

            if (attrs === null)
                return null;

            if (el.tagName === 'componentref')
                componentRefs.push(attrs.id);
            else
                primitiveRefs.push(attrs.id);
        });

        // check if at least one child is defined
        if ((componentRefs.length + primitiveRefs.length) === 0) {
            this.onXMLError(`The component hasn't any children`);
            return null;
        }

        return {
            componentsID: componentRefs,
            primitivesID: primitiveRefs
        };
    }

}