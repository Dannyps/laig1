'use strict';

class Components extends GenericParser {
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

        // ensure at least one light is defined
        if (this.componentsCollection.size === 0) {
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
            hasFallback: true,
            requiredAttrs: {id: 'ss'},
            defaultValues: {}
        });


        let parsedElements = this._parseUniqueChildElements(compEl, requiredElements);

        console.log(parsedElements); debugger;
        // push the components
        this.components.set(attrs.id, {
        });
    }

}