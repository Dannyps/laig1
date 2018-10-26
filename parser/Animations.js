'use strict';

/////// UPDATE THESE DOCS
/**
 * @typedef animation
 * @type {object}
 * @property {(parsedRotate | parsedScale | parsedTranslate)[]} transformation - Array of transformations. Might be empty if it hasn't own transformations 
 * @property children:
 * @property {string[]} primitivesID
 * @property {string[]} animationsID
 * @property {string[]} materials
 * @property texture: any;
 */
class AnimationsParser extends GenericParser {
    /**
     * Parser for <animations> tag
     * @param {*} sceneGraph 
     */
    constructor(sceneGraph) {
        super(sceneGraph);

        // data structure for animations
        this.animations = new Map();
    }

    getParsedA  nimations() {
        return this.animations;
    }

    /**
     * Parses all animations
     * @param {Element} animationsNode 
     * @return {number} Returns -1 if no animations are defined, 0 otherwise
     */
    parse(animationsNode) {
        // find all animation elements and parse them
        let animationsCollection = animationsNode.getElementsByTagName('animation');
        Array.prototype.forEach.call(animationsCollection, (compEl) => {
            this._parseanimations(compEl);
        });

        // ensure at least one animation is defined
        if (this.animations.size === 0) {
            this.onXMLError('You must set at least one animation!');
            return -1;
        }

        return 0;
    }


}