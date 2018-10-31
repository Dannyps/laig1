'use strict';

/////// UPDATE THESE DOCS
 /**
  * @typedef linearAnimation
  * @type {object}
  * @property {string} type - "Linear"
  * @property {number} dadas - 
  * @property {Array.<{xx:number, yy:number, zz:number}} ctrlPoints 
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

    getParsedAnimations() {
        return this.animations;
    }

    /**
     * Parses all animations
     * @param {Element} animationsNode 
     * @return {number} Returns -1 if no animations are defined, 0 otherwise
     */
    parse(animationsNode) {
        if(animationsNode.tagName != 'animations') throw "Unexpected element";

        for(let animation of animationsNode.children) {
            let parsedAnimation = null;
            switch(animation.tagName) {
                case 'linear':
                    // TODO check return
                    this._parseLinearAnimation(animation);
                    break;
                case 'circular':
                    break;
                default:
                    this.onXMLMinorError(`Unknown ${animation.tagName} under <animations> tag`);
            }
        }

        // ensure at least one animation is defined
        if (this.animations.size === 0) {
            this.onXMLError('You must set at least one animation!');
            return -1;
        }

        return 0;
    }

    /**
     * Parses linear animation tags
     * @param {Element} linearEl The <linear> DOM element to be parsed
     * @return {(>|null)} Returns null upon error, otherwise an array of control points
     */
    _parseLinearAnimation(linearEl) {
        if(linearEl.tagName != 'linear') throw "Unexpected element";

        // parse the attributes
        let parsedAttrs = this._parseAttributes(linearEl, {id: 'ss', span: 'ff'});
        if(parsedAttrs === null)
            return null; // failed to parse attributes

        // check animation ID uniqueness
        if(this.animations.has(parsedAttrs.id)) {
            this.onXMLMinorError(`An animation with id ${parsedAnimation.id} already exists!`);
            return null; // conflict
        }

        let ctrlPoints = []; // array of control points
        
        // parse the control points
        for(let ctrlPoint of linearEl.children) {
            if(ctrlPoint.tagName != 'controlpoint') {
                this.onXMLError(`Unexpected element <${ctrlPoint.tagName}> under <linear id=${parsedAttrs.id}>`);
                return null;
            }

            let coords = this._parseAttributes(ctrlPoint, {xx: 'ff', yy: 'ff', zz: 'ff'});
            if(coords === null)
                return null;

            ctrlPoints.push(coords);
        }

        // store the animatin
        this.animations.set(parsedAttrs.id, {
            type: linearEl.tagName,
            ctrlPoints: ctrlPoints,
        });
    }
}