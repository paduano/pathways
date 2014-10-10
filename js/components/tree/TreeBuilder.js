/**
 *
 **/
function TreeBuilder() {
    var self = this;
    var _jointSystem;

    //PUBLIC
    /**
     * Build all the joints and branches of the tree
     * given the final leaves nodes, already subdivided in groups of vec
     * @param rootPos
     * @param nodesGroups groups of vec2
     * @retrun the joint system
     */
    this.buildTree = function(rootPos, allNodes) {


        var jointsHierarchy = buildJoints(allNodes, rootPos, 0/*level*/);
        buildBranches(jointsHierarchy);
        console.log(jointsHierarchy);



        _jointSystem = new JointsSystem(jointsHierarchy.joint);
        return _jointSystem;
    };



    //PRIVATE

    var computeCentroid = function(group) {
        var centroid = vec2(0,0);
        for(var i in group){
            var vec = group[i].getPosition();
            centroid = centroid.addV(vec.divS(group.length));
        }
        return centroid;
    };


    var buildJoints = function(allNodes, root, level) {
        var hierarchy =  {joint: new Joint(root), children: []};

        //split in groups
        var groups = [];

        if(level == 0){
            groups = [allNodes];
        }else if(allNodes.length > 4) {
            groups = [allNodes.slice(0, allNodes.length / 2),
                allNodes.slice(allNodes.length / 2, allNodes.length)];
        } else {
            for(var i in allNodes){
                groups.push([allNodes[i]]);
            }
        }

        //
        for(var g in groups){

            var group = groups[g];

            if(group.length > 1){
                //compute next joint position
                var nextJointPosition = root.addV(
                    computeCentroid(group)
                        .subV(root)
                        .mulS(0.4)
                );
                hierarchy.children.push(buildJoints(group, nextJointPosition, level+1));
            } else {
                //LEAVES
                var leafJoint = new Joint(group[0].getPosition());
                leafJoint.anchor = group[0];
                hierarchy.children.push({joint: leafJoint, children: []});
            }

        }

        //
        return hierarchy;

    };

    var buildBranches = function(hierarchy) {
        if(hierarchy.children.length == 0)
            return;

        var startJoint = hierarchy.joint;
        for(var j in hierarchy.children) {
            var endJoint =  hierarchy.children[j].joint;
            new Branch(startJoint, endJoint);
            buildBranches(hierarchy.children[j]);
        }
    };


    var init = function() {

    }
}