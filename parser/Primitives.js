class Primitives extends GenericParser {
    constructor(sceneGraph) {
        super(sceneGraph);

        // set some default values
        this.rectangle = {x1: '1', y1: '1', x2: '1', y2: '1'};
        this.triangle = {
            x1: '0', y1: '-0.5', z1: '-0.5',
            x2: '0', y2: '0.5', z3: '-0.5',
            x3: '0', y3: '0', z3: '0.5'
        };
		// TODO
		
		// the data container for primitives
		this.primitives = new Map();
	}
	
	getPrimitives() {
		return this.primitives;
	}

	/**
	 * Parses a node of type <primitives>
	 * @param {*} primitivesNode 
	 */
    parser(primitivesNode) {
		let childCollection = primitivesNode.children;

		for(let i = 0; i < childCollection.length; i++) {
			if(this._parsePrimitive(childCollection[i]) === null) {
				// critical error
				return null;
			}
		}

		// check if at least one primitive was set
		if(this.primitives.size === 0){
			this.onXMLError("You must specify at least one primitive");
			return null;
		}
	}
	
	/**
	 * Parses all kind of primitives and returns the relevant information for each kind of element
	 * 
	 * @param {Element} primitiveNode A primitive element with a single child of rectangle || triangle || cylinder || sphere || torus type
	 * 
	 * @return {undefined|null} Returns null upon errors or undefined otherwise
	 */
	_parsePrimitive(primitiveNode) {
		/**
		 * Parse ID and ensure it's set and doesn't exist already
		 */
		let attrs = this._parseAttributes(primitiveNode, {id: 'ss'});

		if(attrs === null) {
			this.onXMLError("ID not specified for primitive. Cannot proceed");
			return null;
		}

		if(this.primitives.has(attrs.id)) {
			this.onXMLError("Primitive with this ID already exists. Cannot proceed");
			return null;
		}

		/**
		 * Invoke the correct parser for this type of primitive
		 */
		let parsedPrimitive;
		switch(primitiveNode.tagName) {
			case 'rectangle':
				parsedPrimitive = this._parseRectangle(primitiveNode);
				break;
			default:
				this.onXMLMinorError("Unknown type of primitive");
				return null;
		}

		// check for errors
		if(parsedPrimitive === null)
			return null;

		// add a type property, for later decide the kind of CGFObject to create
		parsedPrimitive.type = primitiveNode.tagName;

		// add primitive to data structure
		this.primitives.set(attrs.id, parsedPrimitive);
	}

	/**
	 * Parses the attributes from a rectangle element
	 * @param {Element} rectangleEl 
	 * @return {Object|null} Returns null upon error, or returns a an object with the following properties {x1, y1, x2, y2}
	 */
    _parseRectangle(rectangleEl) {
        if(rectangleEl.tagName != 'rectangle')
            throw 'Unexpected element';

		/**
		 * Parse attributes
		 */
		return this._parseAttributes(rectangleEl, {x1: 'ff', y1: 'ff', x2: 'ff', y2: 'ff'}, this.rectangle);
    }
}