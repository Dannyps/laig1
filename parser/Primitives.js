/**
 * @typedef parsedRectangle
 * @type {object}
 * @property {string} type "rectangle"
 * @property {number} x1
 * @property {number} y1
 * @property {number} x2
 * @property {number} y2
 */

/**
 * @typedef parsedTriangle
 * @type {object}
 * @property {string} type "triangle"
 * @property {number} x1
 * @property {number} y1
 * @property {number} z1
 * @property {number} x2
 * @property {number} y2
 * @property {number} z2
 * @property {number} x3
 * @property {number} y3
 * @property {number} z3
 */

/**
 * @typedef parsedCylinder
 * @type {object}
 * @property {string} type "cylinder"
 * @property {number} base
 * @property {number} top
 * @property {number} height
 * @property {number} slices
 * @property {number} stacks
 */

/**
 * @typedef parsedSphere
 * @type {object}
 * @property {number} radius
 * @property {number} slices
 * @property {number} stacks
 */

class Primitives extends GenericParser {
	/**
	 * Responsible to parse primitives
	 * @param {*} sceneGraph 
	 */
	constructor(sceneGraph) {
		super(sceneGraph);

		/**
		 * Default values
		 */
		this.defaultRectangle = {
			x1: '1',
			y1: '1',
			x2: '1',
			y2: '1'
		};
		this.defaultTriangle = {
			x1: '0',
			y1: '-0.5',
			z1: '-0.5',
			x2: '0',
			y2: '0.5',
			z3: '-0.5',
			x3: '0',
			y3: '0',
			z3: '0.5'
		};
		this.defaultCylinder = {
			base: 1,
			top: 1,
			height: 1,
			slices: 10,
			stacks: 20
		}
		this.defaultSphere = {
			base: 1,
			slices: 10,
			stacks: 20
		}

		this.defaultPlane = {
			npartsU: 1,
			npartsV: 1
		}

		this.defaultPatch = {
			npointsU: 1,
			npointsV: 1,
			npartsU: 1,
			npartsV: 1
		}

		this.defaultControlPoints = {
			xx: 1,
			yy: 1,
			zz: 1,
			ww: 1
		}

		/** @description data container with all primitives @type {Map.<string, (parsedRectangle | parsedTriangle | parsedCylinder | parsedSphere)>} */
		this.primitives = new Map();
	}

	/**
	 * Returns all parsed primitives
	 * Each item in the Map structure, in addition to the expected values, it contais a property 'type' to distinguish the CGFObjects
	 * 
	 * @return {Map.<string, (parsedRectangle | parsedTriangle | parsedCylinder | parsedSphere)>}
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

		for (let i = 0; i < childCollection.length; i++) {
			if (this._parsePrimitive(childCollection[i]) === null) {
				// critical error
				return -1;
			}
		}

		// check if at least one primitive was set
		if (this.primitives.size === 0) {
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
		let attrs = this._parseAttributes(primitiveNode, {
			id: 'ss'
		});

		if (attrs === null) {
			this.onXMLError("ID not specified for primitive. Cannot proceed");
			return null;
		}

		if (this.primitives.has(attrs.id)) {
			this.onXMLError("Primitive with this ID already exists. Cannot proceed");
			return null;
		}

		/**
		 * Parse child node
		 */

		if (primitiveNode.children.length != 1) {
			this.onXMLError("Primitive node must have a single node.");
			return null;
		}
		let childNode = primitiveNode.children[0];

		// Invoke the correct parser for this type of primitive
		let parsedPrimitive;
		switch (childNode.tagName) {
			case 'rectangle':
				parsedPrimitive = this._parseRectangle(childNode);
				break;
			case 'triangle':
				parsedPrimitive = this._parseTriangle(childNode);
				break;
			case 'cylinder':
				parsedPrimitive = this._parseCylinder(childNode);
				break;
			case 'sphere':
				parsedPrimitive = this._parseSphere(childNode);
				break;
			case 'torus':
				parsedPrimitive = this._parseTorus(childNode);
				break;
			case 'plane':
				parsedPrimitive = this._parsePlane(childNode);
				break;
			case 'patch':
				parsedPrimitive = this._parsePatch(attrs, childNode);
				break;
			default:
				this.onXMLMinorError("Unknown type of primitive");
				return -5;
		}

		// check for errors
		if (parsedPrimitive === null)
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
		if (rectangleEl.tagName != 'rectangle')
			throw 'Unexpected element';

		/**
		 * Parse attributes
		 */
		return this._parseAttributes(rectangleEl, {
			x1: 'ff',
			y1: 'ff',
			x2: 'ff',
			y2: 'ff'
		}, this.defaultRectangle);
	}

	_parseTriangle(triangleEl) {
		if (triangleEl.tagName != 'triangle')
			throw 'Unexpected element';

		return this._parseAttributes(triangleEl, {
			x1: 'ff',
			y1: 'ff',
			z1: 'ff',
			x2: 'ff',
			y2: 'ff',
			z2: 'ff',
			x3: 'ff',
			y3: 'ff',
			z3: 'ff',
		}, this.defaultTriangle);
	}

	_parseCylinder(cylinderEl) {
		if (cylinderEl.tagName != 'cylinder')
			throw 'Unexpected element';

		return this._parseAttributes(cylinderEl, {
			base: 'ff',
			top: 'ff',
			height: 'ff',
			slices: 'ii',
			stacks: 'ii'
		}, this.defaultCylinder);
	}

	_parseSphere(sphereEl) {
		if (sphereEl.tagName != 'sphere')
			throw 'Unexpected element';

		return this._parseAttributes(sphereEl, {
			radius: 'ff',
			slices: 'ii',
			stacks: 'ii'
		}, this.defaultSphere);
	}

	_parseTorus(torusEl) {
		if (torusEl.tagName != 'torus')
			throw 'Unexpected element';

		return this._parseAttributes(torusEl, {
			inner: 'ff',
			outer: 'ff',
			slices: 'ii',
			loops: 'ii'
		}, this.defaultSphere);
	}

	_parsePlane(planeNurbsEl) {

		return this._parseAttributes(planeNurbsEl, {
			npartsU: 'ff',
			npartsV: 'ff'
		}, this.defaultPlane);
	}

	_parsePatch(attrs, patchNurbsEl) {

		let ret = this._parseAttributes(patchNurbsEl, {
			npointsU: 'ii',
			npointsV: 'ii',
			npartsU: 'ii',
			npartsV: 'ii'
		}, this.defaultPatch);

		let controlPointsEls = patchNurbsEl.children;

		if (controlPointsEls.length != ret.npointsU * ret.npointsV) {
			this.sceneGraph.onXMLError("NURBS Patch (id: '" + attrs.id + "') specifies " + controlPointsEls.length + " controlpoint(s), but it should specify " + ret.npointsU + "*" + ret.npointsV + "=" + ret.npointsU * ret.npointsV + ".");
		}

		let ControlPoints = this._parseControlPoints(patchNurbsEl.children);

		ret.controlVertexes = [];

		for (let i = 0; i < ret.npointsU; i++) {
			ret.controlVertexes[i] = [];
			for(let j = 0 ; j < ret.npointsV;j++){
				ret.controlVertexes[i][j] = ControlPoints[i+j];
			}
			
		}
		debugger;
		return ret;
	}

	_parseControlPoints(elements) {
		let ret = [];
		for (let i = 0; i < elements.length; i++) {
			let el = elements[i];
			ret[i] = Object.values(this._parseAttributes(el, {
				xx: 'ff',
				yy: 'ff',
				zz: 'ff',
				ww: 'ff'
			}, this.defaultControlPoints));
		}

		return ret;
	}
}