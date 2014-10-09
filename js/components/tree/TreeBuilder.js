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
    this.buildTree = function(rootPos, nodesGroups) {

        var root  = new Joint(rootPos);

        var clusters = [];
        for(var g in nodesGroups){
            var group = nodesGroups[g];
            clusters.push(computeCentroid(group));
        }

        var secondLevelCentroid = computeCentroid(clusters);
        var secondLevelPosition = secondLevelCentroid.lerp(rootPos, 0.5);

        var secondLevelJoint = new Joint(secondLevelPosition);
        new Branch(root, secondLevelJoint);





        for(var c in clusters){
            var thirdLevelCentroid = clusters[c];
            var group = nodesGroups[c];
            var thirdLevelJoint = new Joint(thirdLevelCentroid.lerp(secondLevelPosition, 0.3));
            new Branch(secondLevelJoint, thirdLevelJoint );

            for(var n in group) {
                var node = group[n];
                var leaf = new Joint(node);
                new Branch(thirdLevelJoint, leaf );
            }
        }



        _jointSystem = new JointsSystem(root);
        return _jointSystem;
    };



    //PRIVATE

    var computeCentroid = function(group) {
        var centroid = vec2(0,0);
        for(var i in group){
            var vec = group[i];
            centroid = centroid.addV(vec.divS(group.length));
        }
        return centroid;
    };



    var init = function() {

    }
}