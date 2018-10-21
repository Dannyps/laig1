/**
 * @typedef perspectiveView
 * @type {object}
 * @property {string} type - "perspective"
 * @property {number} near
 * @property {number} fear
 * @property {number} fielView - radians
 * @property {{x: number, y: number, z: number}} from
  * @property {{x: number, y: number, z: number}} to
 */

 /**
 * @typedef orthoView
 * @type {object}
 * @property {string} type - "ortho"
 * @property {number} near
 * @property {number} fear
 * @property {number} left
 * @property {number} right
 * @property {number} top
 * @property {number} bottom
 * @property {{x: Number, y: number, z: number}} from
 * @property {{x: Number, y: number, z: number}} to
 */

class Views extends GenericParser {
    /**
     * @constructor
     * @param {MySceneGraph} sceneGraph 
     */
    constructor(sceneGraph) {
        super(sceneGraph);
        
        /**
         * A map where each key is the view's id. The value for each key is an object represeting the view
         * @type {Map.<string, (perspectiveView|orthoView)>}
         */
        this.parsedViews = new Map();

        /**
         * A string with the ID of the default view
         */
        this.defaultView;

        // set some default values
        this.defaultNear = 0.1; // default near clipping plane distance
        this.defaultFar = 1000; // default far clipping plane distance
        this.defaultPerspectiveAngle = Math.PI/2; // default field of view for perspective cameras
        this.defaultTarget = {x: 0, y:0, z:0}; // default target position
        this.defaultPosition = {x:15, y:15, z:15}; // default camera position
    }

    /**
     * Returns all parsed views
     * @return {Map.<string, (perspectiveView|orthoView)>}
     */
    getParsedViews() {
        return this.parsedViews;
    }

    /**
     * Returns the id for the default view
     * @return {string}
     */
    getDefaultViewID() {
        return this.defaultView;
    }

    /**
     * Parses all the views
     * @param {Element} viewsNode The <views> element to be parsed
     * @return {number} Returns 0 upon success, or any other value otherwise
     */
    parse(viewsNode) {
        // get the default view ID
        let attrs = this._parseAttributes(viewsNode, {default: 'ss'});

        // check if some error ocurred
        if(attrs === null)
            return -1;
        
        // parse all the views and add them to the parsedViews map
        let childViews = viewsNode.children;
        Array.prototype.forEach.call(childViews, el => {
            if(el.tagName === 'perspective') {
                this._parsePerspectives(el);
            } else if(el.tagName === 'ortho') {
                this._parseOrtho(el);
            } else {
                // unknown tag
            }
        });

    
        // check if at least one view is defined
        if(this.parsedViews.size === 0) {
            this.onXMLError("You must scecify at least one view");
            return -1;
        }

        // check if default camera exists and assign a fallback if needed
        if(!this.parsedViews.has(attrs.default)) {
            let firstParsedView = this.parsedViews.entries().next().value; /** @type {[key, value]} */
            this.onXMLMinorError(`The specified default camera '${attrs.default}' doesn't exist! Using the first parsed view ${firstParsedView[0]}`);
            this.defaultView = firstParsedView[0];
        } else {
            this.defaultView = attrs.default;
        }

        return 0;
    }

    /**
     * Parses perspective views and pushes it to the member {@link Views#parsedViews}
     * If the attribute 'id' is not set the view is ignored. If some view with the same 'id' already exists it's also skipped.
     * @param {Element} perspectiveEl A <perspective> element
     * @return {(null|Number)} Returns null upon errors, or 0 upon success
     */
    _parsePerspectives(perspectiveEl) {
        /**
         * Parse the attributes and check uniqueness of the ID
         */
        let properties = this._parseAttributes(perspectiveEl, {
            id: 'ss',
            near: 'ff',
            far: 'ff',
            angle: 'ff'
        }, {
            near: this.defaultNear,
            far:this.defaultFar,
            angle: this.defaultPerspectiveAngle
        });

        // check if attributes were parsed successfully
        if(properties === null)
            return null;
        
        // check if ID is unique
        if(this.parsedViews.has(properties.id)) {
            this.onXMLMinorError(`The ID must be unique. '${properties.id}' is already taken! This view will be ignored.`);
            return null;
        }

        // parse <to> and <from> child elements
        let childs = this._parseChildNodes(perspectiveEl);
        
        /**
         * Add this view to the parsed views Map
         */
        this.parsedViews.set(properties.id, {
            type: 'perspective',
            near: properties.near,
            far: properties.far,
            fieldView: properties.angle * Math.PI/180, // converting to degrees
            from: childs.get('from') || this.defaultPosition,
            to: childs.get('to') || this.defaultTarget
        });

        return 0;
    }


    _parseOrtho(orthoEl) {
        /**
         * Parse the attributes and check uniqueness of the ID
         */
        let properties = this._parseAttributes(orthoEl, {
            id: 'ss',
            near: 'ff',
            far: 'ff',
            left: 'ff',
            right: 'ff',
            top: 'ff',
            bottom: 'ff'
        }, {
            near: this.defaultNear,
            far: this.defaultFar,
            angle: this.defaultFieldView
        });

        // check if attributes were parsed successfully
        if(properties === null)
            return null;
        
        // check if ID is unique
        if(this.parsedViews.has(properties.id)) {
            this.onXMLMinorError(`The ID must be unique. '${properties.id}' is already taken! This view will be ignored.`);
            return null;
        }

        // parse <to> and <from> child elements
        let childs = this._parseChildNodes(orthoEl);
        
        /**
         * Add this view to the parsed views Map
         */
        this.parsedViews.set(properties.id, {
            type: 'ortho',
            near: properties.near,
            far: properties.far,
            left: properties.left,
            right: properties.right,
            top: properties.top,
            bottom: properties.bottom,
            from: childs.get('from') || this.defaultPosition,
            to: childs.get('to') || this.defaultTarget
        });

        return 0;
    }

    /**
     * Parses the child elements of <ortho> and <perspective> elements. The expected childs are <from> and <to> and must be unique
     * @param {Element} viewNode One of <ortho> or <perspective> elements
     * @return @see {@link GenericParser#_parseUniqueChildElements()}
     */
    _parseChildNodes(viewNode) {
        /**
         * Parse child elements TO and FROM
         */
        let requiredElements = new Map();
        let requiredAttrs =  {x: 'ff', y: 'ff', z: 'ff'};

        requiredElements.set('from', {
            hasFallback: true,
            requiredAttrs: requiredAttrs,
            defaultValues: {x: this.defaultPosition.x, y: this.defaultPosition.y, z: this.defaultPosition.z}
        });

        requiredElements.set('to', {
            hasFallback: true,
            requiredAttrs: requiredAttrs,
            defaultValues: {x: this.defaultTarget.x, y: this.defaultTarget.y, z: this.defaultTarget.z}
        });

        // parse <to> and <from> child elements
        return this._parseUniqueChildElements(viewNode, requiredElements);
    }
}