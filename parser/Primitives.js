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
		this.cylinder = {
			base: 1,
			top: 1,
			height: 1,
			slices: 10,
			stacks: 20
		}
		// TODO
		
		// the data container for primitives
		this.primitives = new Map();
	}
	
	/**
	 * Returns all parsed primitives
	 * Each item in the Map structure, in addition to the expected values, it contais a property 'type' to distinguish the CGFObjects
	 * 
	 * @return {Map<String, Object>}
	 */
	getPrimitives() {
		return this.primitives;
	}

	/**
	 * Parses a node of type <primitives>
	 * @param {*} primitivesNode 
	 */
    parse(primitivesNode) {
		let childCollection = primitivesNode.children;

		for(let i = 0; i < childCollection.length; i++) {
			if(this._parsePrimitive(childCollection[i]) === null) {
				// critical error
				return -1;
			}
		}

		// check if at least one primitive was set
		if(this.primitives.size === 0){
			this.onXMLError("You must specify at least one primitive");
			return -1;
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
		 * Parse child node
		 */

		if(primitiveNode.children.length != 1) {
			this.onXMLError("Primitive node must have a single node.");
			return null;
		}
		let childNode = primitiveNode.children[0];

		// Invoke the correct parser for this type of primitive
		let parsedPrimitive;
		switch(childNode.tagName) {
			case 'rectangle':
				parsedPrimitive = this._parseRectangle(childNode);
				break;
			case 'triangle':
				parsedPrimitive = this._parseTriangle(childNode);
				break;
			case 'cylinder':
				parsedPrimitive = this._parseCylinder(childNode);
				break;
			default:
				this.onXMLMinorError("Unknown type of primitive");
				return null;
		}

		// check for errors
		if(parsedPrimitive === null)
			return null;

		// add a type property, for later decide the kind of CGFObject to create
		parsedPrimitive.type = childNode.tagName;

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
	
	_parseTriangle(triangleEl) {
		if(triangleEl.tagName != 'triangle')
			throw 'Unexpected element';
			
		return this._parseAttributes(triangleEl, {
			x1: 'ff', y1: 'ff', z1: 'ff',
			x2: 'ff', y2: 'ff', z2: 'ff',
			x3: 'ff', y3: 'ff', z3: 'ff',
		}, this.triangle);
	}

	_parseCylinder(cylinderEl) {
		if(cylinderEl.tagName != 'cylinder')
			throw 'Unexpected element';
			
		return this._parseAttributes(cylinderEl, {
			base: 'ff', top: 'ff', height: 'ff', slices: 'ii', stacks: 'ii'
		}, this.cylinder); 
	}
}