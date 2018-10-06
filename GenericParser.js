'use strict';

class GenericParser {
    constructor(sceneGraph) {
        this.sceneGraph = sceneGraph;
    }

    /**
     * The method to be called in order to parse a main XML element (lights, views, ambient, etc.) 
     */
    parse() {
        throw 'parse() must be implement on sub-classes';
    }

    /**
     * Generic method that parses the attributes of an element
     * Note: It won't touch any of the child nodes of the element
     * 
     * @param {Element} element The XML element to be parsed
     * @param {Object} requiredAttrs An object where each property is a pair (name, type). The property name/key matches the attribute name, and the type is one of ff||ii||ss||cc||tt
     * @param {Object} defaultValues An object with default values, if any, for the attributes. If some attribute is missing, or doesn't have a valid value, but there's a default/fallback value, then the default is used and a minor error is generated. Otherwise, it generates an error and returns.
     * 
     * Example:
     * requiredAttrs = {r: 'ff', g: 'ff', b: 'ff'}
     * defaultValues = {r: 0.5, g: 0.5, b: 1}
     * 
     * @returns {null} If some error ocurred
     * @returns {Object} An object where each property name matches a required attribute and the respective value
     */
    _parseAttributes(element, requiredAttrs, defaultValues) {
        let parsedAttrs = {};

        Object.getOwnPropertyNames(requiredAttrs).forEach(requiredAttrName => {
            // check if element contains the attribute
            if(element.hasAttribute(requiredAttrName)) {
                // attempt to parse the attribute and ensure the value is valid
                let val = this._parseAttributeVal(
                    element,
                    requiredAttrName, 
                    element.getAttribute(requiredAttrName), 
                    requiredAttrs[requiredAttrName],
                    defaultValues);

                if(val === null) return null;
                else parsedAttrs[requiredAttrName] = val;

            } else {
                // attribute not defined
                // try to get a default as a fallback
                let val = this._getDefaultValue(requiredAttrName, defaultValues);
                if(val === null) {
                    this._showAttributeNotFound(element.tagName, requiredAttrName, false);
                    return null;
                } else {
                    this._showAttributeNotFound(element.tagName, requiredAttrName, true);
                    parsedAttrs[requiredAttrName] = val;
                }
            }
        });

        return parsedAttrs;
    }

    /**
     * Validates a given value of an attribute, ensuring its type is valid. If it's not, displays a warning and attempts to return a default value. It no default value is set, displays an error and returns null.
     * @param {Element} element Meh, only used for error messages...
     * @param {String} attrName The attribute name
     * @param {String} attrVal The attribute value in YAS/XML
     * @param {String} expectedType The expected type for the attribute ff||ii||ss||cc||tt
     * @param {Object} defaultValues @see {@link _parseAttributes}
     */
    _parseAttributeVal(element, attrName, attrVal, expectedType, defaultValues) {
        // retVal is the value to be returned
        let retVal = null;

        /* deal with 'ii' and 'ff' */
        if(expectedType == 'ff' || expectedType == 'ii' ) {
            // first attempt to convert to JS Number type. If it fails, it becomes NaN
            let num = Number(attrVal);

            if(!Number.isNaN(num)) {
                // it's a valid number type, but if 'ii' is expected, is it really integer?
                if(expectedType == 'ii') {
                    if (Number.isInteger(num)) retVal = num; 
                } else {
                    retVal = num;
                }
            }
        } 
        /* deal with 'ss' */
        else if (expectedType == 'ss') {
            // TODO: is there anything to check here?
            retVal = attrVal;
        } 
        /* deal with 'tt' */
        else if (expectedType == 'tt') {
            if(attrVal === 'true') retVal = true;
            else if (attrVal === 'false') retVal = false;
        } 
        /* deal with 'cc' */
        else if (expectedType == 'cc') {
            // cc can be 'x', 'y', or 'z'
            if(['x', 'y', 'z'].includes(attrVal)) retVal = attrVal;
        }
        /* deal with unknown expected type */
        else throw `Unknown expected type for attribute ${attrName}`;

        // at this stage, if retVal is null, it means that the attrVal is not of the expected type, thus we attemp to get the default value
        if(retVal === null) {
            retVal = this._getDefaultValue(attrName, defaultValues);

            // if retVal still 'null' then there's no fallback value and the error is displayed
            if(retVal === null) {
                this._showUnexpectedAttrValue(element.tagName, attrName, false);
                return null;
            } else {
                // a default value was found, just display a warning
                this._showUnexpectedAttrValue(element.tagName, attrName, true);
                return retVal;
            }
        }
        
        return retVal;
        
    }

    /**
     * Gets the default value for a given attribute.
     * @param {*} attrName 
     * @param {*} defaultValues @see {@link _parseAttributes}
     * 
     * @returns {*|null} Returns the default value. If it doesn't exist, return 'null'
     */
    _getDefaultValue(attrName, defaultValues) {
        if(defaultValues.hasOwnProperty(attrName)) {
            return defaultValues[attrName];
        } else {
            return null;
        }
    }

    /**
     * Used to display formatted messages when an expected attribute is not found
     * @param {String} elementName The element's name for which the attribute wasn't found 
     * @param {String} attrName The expected attribute name
     * @param {Boolean} hasFallback If true, it means there's a default/fallback value to be used, thus it's a minor issue (warning). Displays an error otherwise
     */
    _showAttributeNotFound(elementName, attrName, hasFallback) {
        if(hasFallback) {
            // minor issue, it has a fallback value
            this.sceneGraph.onXMLMinorError(`[${this.constructor.name.toUpperCase()}] Attribute '${attrName}' is not set for element <${elementName}>. Using default value`);
        } else {
            // error
            this.sceneGraph.onXMLError(`[${this.constructor.name.toUpperCase()}] Attribute '${attrName}' is not set for element <${elementName}>. Cannot proceed`);
        }
    }

    /**
     * 
     * @param {String} elementName The element's name for which the attribute wasn't found 
     * @param {String} attrName The expected attribute name
     * @param {Boolean} hasFallback If true, it means there's a default/fallback value to be used, thus it's a minor issue (warning). Displays an error otherwise
     */
    _showUnexpectedAttrValue(elementName, attrName, hasFallback) {
        if(hasFallback) {
            // minor issue, it has a fallback value
            this.sceneGraph.onXMLMinorError(`[${this.constructor.name.toUpperCase()}] Unexpected value type for attribute '${attrName}' in element <${elementName}>. Using default value`);
        } else {
            // error
            this.sceneGraph.onXMLError(`[${this.constructor.name.toUpperCase()}] Unexpected value type for attribute '${attrName}' in element <${elementName}>. Cannot proceed`);
        }
    }
}