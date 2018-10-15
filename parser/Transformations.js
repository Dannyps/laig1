'use strict';

/**
 * @typedef parsedTranslate
 * @type {object}
 * @property {string} type - "translate"
 * @property {number} x 
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef parsedScale
 * @type {object}
 * @property {string} type - "scale"
 * @property {number} x 
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef parsedRotate
 * @type {object}
 * @property {string} type - "rotate"
 * @property {string} axis - 'x' | 'y' | 'z'
 * @property {number} angle - The rotation angle in degrees
 */


class Transformations extends GenericParser {
    /**
     * Parses transformations
     * @param {CGFscene} sceneGraph 
     */
    constructor(sceneGraph) {
        super(sceneGraph);

        /**
         * A map containing all parsed transformations, mapping each transformation ID to a collection of trasnformation instructions
         * @type {Map.<string, Array.<parsedRotate | parsedScale | parsedTranslate>>}
         */
        this.transformations = new Map();
    }

    /**
     * @return {Map.<string, Array.<parsedRotate | parsedScale | parsedTranslate>>}
     */
    getParsedTransformations() {
        return this.transformations;
    }

    /**
     * Parses all transformations under the <transformations> element.
     * @param {Element} transformationsNode 
     * @return {number} Returns 0 upon success, otherwise returns -1. Also see {@link Transformations#_parseTransformations}
     */
    parse(transformationsNode) {
        // find all transformation elements and parse them
        let transfsCollection = transformationsNode.getElementsByTagName('transformation');
        for(let i = 0; i < transfsCollection.length; i++) {
            if(this._parseTransformations(transfsCollection[i]))
                return -1; // something went wrong
        }

        // ensure at least one texture is defined
        if (this.transformations.size === 0) {
            this.onXMLError('You must set at least one transformation!');
            return -1;
        } else {
            return 0;
        }
    }

    /**
     * Parses a set of instructions that compose a transformation and adds it {@link Transformations#transformations}
     * This function is sensitive to erros, because errors in transformations easily lead to caotic scenes.
     * If attributes are missing or unknown tags are found, the function stops processing and returns -1.
     * @param {Element} tranfsEl An element <transformation> to be processed
     * @return {number} Returns 0 upon success, or -1 otherwise 
     */
    _parseTransformations(tranfsEl) {
        if (tranfsEl.tagName !== 'transformation') throw 'Unexpected element';

        /**
         * Parse the ID attribute
         */
        let attrs = this._parseAttributes(tranfsEl, {id: 'ss'});

        if (attrs === null)
            return -1; // some error happened, abort
        
        // check if id is unique
        if(this.transformations.has(attrs.id)) {
            this.onXMLError(`IDs for transformations must be unique! ${attrs.id} already taken`);
            return -1; // abort
        }

        /**
         * Parse child elements, representing transformation instructions
         */
        let instructions = []; // array with all transformations

        // iterate over the children elements
        let transfInstructions = tranfsEl.children;
        for(let i = 0; i < transfInstructions.length; i++) {
            let aux;
            switch(transfInstructions[i].tagName) {
                case 'translate': 
                    aux = this._parseTranslate(transfInstructions[i]);
                    break;
                case 'rotate':
                    aux = this._parseRotate(transfInstructions[i]);
                    break;
                case 'scale':
                    aux = this._parseScale(transfInstructions[i]);
                    break;
                default:
                    this.onXMLError(`Unknown element ${transfInstructions[i].tagName}. ABORT!`);
                    return -1;
            }

            // failed to parse instruction, abort
            if(aux === null)
                return -1;
            else {
                aux.type = transfInstructions[i].tagName; // identify the kind of transformation
                instructions.push(aux);
            }
        }

        // check if the transformation has at least one instruction
        if(instructions.length === 0) {
            this.onXMLError(`The transformation with ID: ${attrs.id} has zero instructions`);
            return -1;
        }

        this.transformations.set(attrs.id, instructions);
        return 0;
    }

    /**
     * Parses <translate> elements
     * @param {Element} translateEl 
     * @return {(null | {x: number, y: number, z: number})}
     */
    _parseTranslate(translateEl) {
        if(translateEl.tagName !== 'translate') throw "Unexpected element";

        let requiredAttrs = {x: 'ff', y: 'ff', z: 'ff'};
        return this._parseAttributes(translateEl, requiredAttrs);
    }

    /**
     * Parses <rotate> elements
     * @param {Element} rotateEl 
     * @return {(null | {axis: string, angle: number})}
     */
    _parseRotate(rotateEl) {
        if(rotateEl.tagName !== 'rotate') throw "Unexpected element";

        let requiredAttrs = {axis: 'cc', angle: 'ff'};
        return this._parseAttributes(rotateEl, requiredAttrs);
    }

    /**
     * Parses <scale> elements
     * @param {Element} scaleEl 
     * @return {(null | {x: number, y: number, z: number})}
     */
    _parseScale(scaleEl) {
        if(scaleEl.tagName !== 'scale') throw "Unexpected element";

        let requiredAttrs = {x: 'ff', y: 'ff', z: 'ff'};
        return this._parseAttributes(scaleEl, requiredAttrs);
    }

}