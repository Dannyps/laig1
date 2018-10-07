'use strict';

class Textures extends GenericParser{
    constructor(sceneGraph) {
        super(sceneGraph);

        // data structure
        this.textures = new Map();
    }

    parse(textsNode) {
        // find all text elements and parse them
        let textsCollection = textsNode.getElementsByTagName('texture');
        Array.prototype.forEach.call(textsCollection, (textsEl) => {
            this._parseTextures(textsEl);
        });

        // ensure at least one texture is defined
        if(this.textures.size === 0) {
            this.onXMLError('You must set at least one texture!');
            return -1;
        }
    }

    _parseTextures(textsEl) {
        if(textsEl.tagName !== 'texture') throw 'Unexpected element';

        /**
         * Parse the attributes for the omni element
         */
        let attrs = this._parseAttributes(textsEl, {id: 'ss', file: 'ss'});

        if(attrs === null) {
            // some error happened, skip this text
            return;
        }

        this.debug("read a textEL with filename: "+attrs.file);
        
        // push the texture data
        this.textures.set(attrs.id, {
            file: attrs.file
        });
    }

}