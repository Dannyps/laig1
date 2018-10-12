'use strict';

class Transformations extends GenericParser {
    constructor(sceneGraph) {
        super(sceneGraph);

        // data structure
        this.transformations = new Map();
    }

    parse(transformationsNode) {
        // find all text elements and parse them
        let transfsCollection = transformationsNode.getElementsByTagName('transformation');
        Array.prototype.forEach.call(transfsCollection, (tranfsEl) => {
            this._parseTransformations(tranfsEl);
        });

        // ensure at least one texture is defined
        if (this.transformations.size === 0) {
            this.onXMLError('You must set at least one transformation!');
            return -1;
        }
    }

    _parseTransformations(tranfsEl) {
        if (tranfsEl.tagName !== 'transformation') throw 'Unexpected element';


        let attrs = this._parseAttributes(tranfsEl, {
            id: 'ss'
        });

        if (attrs === null) {
            // some error happened, skip this text
            return;
        }

        /**
         * Setup the parser for child elements
         */
        let requiredElements = new Map();

        requiredElements.set('translate', {
            hasFallback: true,
            requiredAttrs: {
                x: 'ff',
                y: 'ff',
                z: 'ff'
            },
            defaultValues: this.ambient
        });

        requiredElements.set('rotate', {
            hasFallback: true,
            requiredAttrs: {
                axis: 'cc',
                angle: 'ff'
            },
            defaultValues: this.diffuse
        });

        requiredElements.set('scale', {
            hasFallback: true,
            requiredAttrs: {
                x: 'ff',
                y: 'ff',
                z: 'ff'
            },
            defaultValues: this.specular
        });


        let tr = this._parseUniqueChildElements(tranfsEl, requiredElements);
        // push the texture data
        if (this.transformations.get(attrs.id) != undefined) {
            this.onXMLError("There are two transformations with the same ID! Last will be used.");
        }
        this.transformations.set(attrs.id, tr);
    }

}