'use strict';

/////// UPDATE THESE DOCS
 /**
  * @typedef linearAnimation
  * @type {object}
  * @property {string} type - "linear"
  * @property {number} dadas - 
  * @property {Array.<{xx:number, yy:number, zz:number}} ctrlPoints 
  */

/**
  * @typedef circularAnimation
  * @type {object}
  * @property {string} type - "circular"
  * @property {string} id - 
  * @property {number} span - The animation duration
  * @property {{x: number, y: number, z: number}} center - The center of the animation
  * @property {number} radius - The radius of the circular animation
  * @property {number} startang - The initial angle (degrees)
  * @property {number} rotang - The total amount of rotation (degrees)
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
                    this._parseCircularAnimation(animation);
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
            span: parsedAttrs.span,
            type: linearEl.tagName,
            ctrlPoints: ctrlPoints,
        });
    }

    /**
     * 
     * @param {Element} circEl 
     * @return {(null|undefined)} Returns null upon errors
     */
    _parseCircularAnimation(circEl) {
        if(circEl.tagName != 'circular') throw "Unexpected element";

        // parse the attributes
        let parsedAttrs = this._parseAttributes(circEl, {
            id: 'ss', 
            span: 'ff',
            center: 'ss',
            radius: 'ff',
            startang: 'ff',
            rotang: 'ff'
        });

        if(parsedAttrs === null)
            return null; // failed to parse attributes

        // altough the center was parsed as string, it contains three floating point values
        let counter = 0;
        let centerCoord = {};
        for(let el of parsedAttrs.center.split(' ')) {
            if(el === ' ') break; // skip
            
            let num = Number(el);
            if(isNaN(num)) {
                this.onXMLError("Invalid whatever center coords");
                return null;
            }

            switch(counter) {
                case 0: 
                    centerCoord.x = num;
                    break;
                case 1:
                    centerCoord.y = num;
                    break;
                case 2: 
                    centerCoord.z = num;
                    break;
                default:
                    this.onXMLMinorError("Unexpected number values");
            }

            counter++;
        };

        // save animation properties
        parsedAttrs.type = circEl.tagName;
        parsedAttrs.center = centerCoord;
        this.animations.set(parsedAttrs.id, parsedAttrs);
    }
}