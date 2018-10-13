/**
 * Responsible to parse <scene> elements
 */
class Scene extends GenericParser {
    /**
     * 
     * @param {*} sceneGraph The scene graph
     */
    constructor(sceneGraph) {
        super(sceneGraph);
    }

    /**
     * Parses the <scene> element and adds the information to the scene Graph
     * @param {Element} sceneNode A <scene> DOM element
     * @return {Number} Returns 0 upon success, or any other number if some error happens
     */
    parse(sceneNode) {
        let parsedAttrs = this._parseAttributes(sceneNode, {root: 'ss', axis_length: 'ff'}, {axis_length: 1.0});
        
        // failed to parse one of the attrs
        if(parsedAttrs === null)
            return -1;

        // update graph scene variables
        this.sceneGraph.idRoot = parsedAttrs.root;
        this.sceneGraph.referenceLength = parsedAttrs.axis_length;

        return 0;
    }
}