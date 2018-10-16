'use strict';

class Components2 extends GenericParser {
    constructor(sceneGraph) {
        super(sceneGraph);

        // set default values


        // data structure for components
        this.components = new Map();
    }

    parse(componentsNode) {
        // find all omni elements and parse them
        let componentsCollection = componentsNode.getElementsByTagName('component');
        Array.prototype.forEach.call(componentsCollection, (compEl) => {
            this._parseComponents(compEl);
        });

        console.log(this.components); debugger;

        // ensure at least one component is defined
        if (this.components.size === 0) {
            this.onXMLError('You must set at least one component!');
            return -1;
        }
    }

    _parseComponents(compEl) {
        if (compEl.tagName !== 'component') throw 'Unexpected element';

        /**
         * Parse the attributes for the component
         */
        let attrs = this._parseAttributes(compEl, {
            id: 'ss',
        }, {});

        if (attrs === null) {
            // some error happened, skip this component
            return;
        }

        /**
         * Setup the parser for child elements
         */
        let requiredElements = new Map();

        requiredElements.set('transformationref', {
            hasFallback: this.FALLBACK_IGN,
            requiredAttrs: {
                id: 'ss'
            },
            defaultValues: {}
        });

        requiredElements.set('primitiveref', {
            hasFallback: this.FALLBACK_IGN,
            requiredAttrs: {
                id: 'ss'
            },
            defaultValues: {}
        });

        requiredElements.set('componentref', {
            hasFallback: this.FALLBACK_IGN,
            requiredAttrs: {
                id: 'ss'
            },
            defaultValues: {}
        });

        requiredElements.set('transformation', {
            hasFallback: this.FALLBACK_IGN,
            requiredAttrs: {},
            defaultValues: {}
        });

        requiredElements.set('materials', {
            hasFallback: this.FALLBACK_IGN,
            requiredAttrs: {},
            defaultValues: {}
        });

        requiredElements.set('texture', {
            hasFallback: this.FALLBACK_IGN,
            requiredAttrs: {
                id: 'ss',
                length_s: "ff",
                length_t: "ff"
            },
            defaultValues: {
                length_s: 1,
                length_t: 1
            }
        });

        requiredElements.set('children', {
            hasFallback: this.FALLBACK_IGN,
            requiredAttrs: {},
            defaultValues: {}
        });


        let parsedElements = this._parseUniqueChildElements(compEl, requiredElements);

        
        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < compEl.children.length; i++) {
            nodeNames.push(compEl.children[i].nodeName);
        }

        // transformations 

        if (parsedElements.has('transformationref')){
            // transformationref was found. We needn't look for further transformations.
        }else{
            let transformationsNode = compEl.children[nodeNames.indexOf("transformation")];
            let transformations = new Transformations(this);
            parsedElements.set('transformation', transformations._parseTransformations(transformationsNode, false));
        }
        // -------------------------------------------

        // materials

        let materialsNode = compEl.children[nodeNames.indexOf("materials")];
        let materials = new Materials(this);
        parsedElements.set('materials', materials.parseMaterialRefs(materialsNode));
        // -------------------------------------------

        // texture

        let texturesNode = compEl.children[nodeNames.indexOf("texture")];
        let textures = new Textures(this);
        parsedElements.set('textures', textures.parseTextRef(texturesNode));

        // -------------------------------------------


        // push the components
        this.components.set(attrs.id, parsedElements);
    }

}