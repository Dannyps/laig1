// set some default values
const defaultNear = 0.1; // default near clipping plane distance
const defaultFar = 1000; // default far clipping plane distance
const defaultFieldView = 0.5; // default field of view for perspective cameras
const defaultTarget = {x: 0, y:0, z:0}; // default target position
const defaultPosition = {x:15, y:15, z:15}; // default camera position

class Views extends GenericParser {
    constructor(sceneGraph) {
        super(sceneGraph);
        
        this.parsedViews = new Map();
        this.defaultView;
    }

    getParsedViews() {
        return this.parsedViews;
    }

    getDefaultViewID() {
        return this.defaultView;
    }

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

            } else {
                // unknown tag
            }
        });

        // check if default camera ID exists and add this value to the scene graph
        this.defaultView = attrs.default;
        // TODO

        return 0;
    }


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
            near: defaultNear,
            far: defaultFar,
            angle: defaultFieldView
        });

        // check if attributes were parsed successfully
        if(properties === null)
            return null;
        
        // check if ID is unique
        if(this.parsedViews.has(properties.id)) {
            this.onXMLMinorError(`The ID must be unique. '${properties.id}' is already taken! This view will be ignored.`);
            return null;
        }

        /**
         * Parse child elements TO and FROM
         */
        let requiredElements = new Map();
        let requiredAttrs =  {x: 'ff', y: 'ff', z: 'ff'};

        requiredElements.set('from', {
            hasFallback: true,
            requiredAttrs: requiredAttrs,
            defaultValues: {x: defaultFieldView[0], y: defaultFieldView[1], z: defaultFieldView[2]}
        });

        requiredElements.set('to', {
            hasFallback: true,
            requiredAttrs: requiredAttrs,
            defaultValues: {x: defaultTarget[0], y: defaultTarget[1], z: defaultTarget[2]}
        });

        // parse <to> and <from> child elements
        let childs = this._parseUniqueChildElements(perspectiveEl, requiredElements);
        
        /**
         * Add this view to the parsed views Map
         */
        this.parsedViews.set(properties.id, {
            type: 'perspective',
            near: properties.near,
            far: properties.far,
            fieldView: properties.angle,
            from: childs.get('from') || defaultValues,
            to: childs.get('to') || defaultValues
        });

        return 0;
    }
}