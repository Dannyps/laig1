class Scene extends GenericParser {
    
    constructor(sceneGraph) {
        super(sceneGraph);
    }

    parse(sceneNode) {
        let parsedAttrs = this._parseAttributes(sceneNode, {root: 'ss', axis_length: 'ff'}, {axis_length: 1.0});
        
        if(parsedAttrs === null) {
            // failed to parse one of the attrs
            return -1;
        }

        // update graph scene variables
        this.sceneGraph.idRoot = parsedAttrs.root;
        this.sceneGraph.referenceLength = parsedAttrs.axis_length;

        return null;
    }
}