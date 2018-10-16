'use strict';

class Textures extends GenericParser {
    /**
     * 
     * @param {MySceneGraph} sceneGraph 
     */
    constructor(sceneGraph) {
        super(sceneGraph);

        /** 
         * @description data structure for textures 
         * @type {{Map.<string, string>}} The key is the texture ID, and value is filename 
         */
        this.textures = new Map();
    }

    /**
     * Returns all successfully parsed textures
     * @return {{Map.<string, string>}} For each map entry, the key is the texture ID, and value is filename 
     */
    getParsedTextures() {
        return this.textures;
    }

    /**
     * Parses all textures
     * @param {Element} textsNode The <textures> element to be parsed
     * @return {number} Returns 0 upon success, or any other value otherwise
     */
    parse(textsNode) {
        // find all text elements and parse them
        let textsCollection = textsNode.getElementsByTagName('texture');
        Array.prototype.forEach.call(textsCollection, (textsEl) => {
            this._parseTextures(textsEl);
        });

        // ensure at least one texture is defined
        if (this.textures.size === 0) {
            this.onXMLError('You must set at least one texture!');
            return -1;
        }

        return 0;
    }

    /**
     * Parses each texture node and if no attributes are missing and the ID is unique, it's added to the member {@link Textures#textures}
     * Upon errors messages are shown and the texture is skipped
     * @param {Element} textsEl Parsed <texture> nodes
     */
    _parseTextures(textsEl) {
        if (textsEl.tagName !== 'texture') throw 'Unexpected element';

        /**
         * Parse the attributes for the omni element
         */
        let attrs = this._parseAttributes(textsEl, {
            id: 'ss',
            file: 'ss'
        });

        if (attrs === null)
            return;

        // check the ID is unique
        if (this.textures.has(attrs.id)) {
            this.onXMLError(`The ID ${attrs.id} is already taken by another texture. This one will be ignored`);
            return;
        }

        this.textures.set(attrs.id, attrs.file);
    }

    parseTextRef(textEl) {
        return this._parseAttributes(textEl, {
            id: 'ss',
            length_s: 'ff',
            length_t: 'ff'
        }, {});
    }

}