function TreeRender(svg, jointsSystem) {
    var self = this;
    var _jointsSystem = jointsSystem;
    var _svg = svg,
        _g = null,
        treePath = null;

    this.drawSekeleton = function() {
        var updateJoint = function(joint) {

            joint.svgCircle
                .attr("cx", joint.position.x)
                .attr("cy", joint.position.y);
        };

        var updateBranch = function(branch) {
            branch.svgLine
                .attr("x1",branch.parentJoint.position.x)
                .attr("y1",branch.parentJoint.position.y)
                .attr("x2",branch.destinationJoint.position.x)
                .attr("y2",branch.destinationJoint.position.y);
        };

        _jointsSystem.recursiveWalk(updateJoint, updateBranch);

    };

    this.draw = function () {
        treePath
            .attr("d", getTreePath())
        ;
    };

    /** visit all the joints and branches in such a way to
     *  describe a anticlockwise perimeter
     *  each joint is visited n times where n equals the number of outgoing branches
     *  a index of the current visit is passed to the joint callback function
     */
    var drawWalkthrough = function(jointCallback, currentJoint) {
        currentJoint = currentJoint || _jointsSystem.getRoot();
        jointCallback(currentJoint, 0);
        currentJoint.branches.forEach(
            function(branch, i) {
                drawWalkthrough(jointCallback, branch.destinationJoint);
                jointCallback(currentJoint, i + 1);
            }
        );
    };

    var setUpSkeleton = function(g) {
        var count = 0;

        var buildJoint = function(joint) {
                 var drag = d3.behavior.drag()
                .on("dragstart", function(){

                })
                .on("drag", function(){

                    joint.addExternalForce(new Vec2( d3.event.x - joint.position.x,
                                                d3.event.y - joint.position.y));
                })
                .on("dragend", function(){
                    joint.resetExternalForce();
                });


                joint.svgCircle = g.append("circle")
                    .classed("tree-joint",true)
                    .attr("cx", joint.position.x)
                    .attr("cy", joint.position.y)
                    .attr("r" , 2)
                    .call(drag);

            };

        var buildBranch = function(branch) {
                branch.svgLine = g.append("line")
                    .classed("tree-line", true)
                    .attr("x1",branch.parentJoint.position.x)
                    .attr("y1",branch.parentJoint.position.y)
                    .attr("x2",branch.destinationJoint.position.x)
                    .attr("y2",branch.destinationJoint.position.y);
            };

        _jointsSystem.recursiveWalk(buildJoint, buildBranch);

        //Draw visiting order
       /* drawWalkthrough(
            function(joint,index){

                    g.append("text")
                        .attr("x", joint.position.x - 5 + (index * 5))
                        .attr("y", joint.position.y)
                        .attr("fill","black")
                        .attr("font-size", 3)
                        .text(count++);

            }
        );*/

    };

    var setUpPath = function (g) {
         treePath = g.append("path")
         .classed("tree-path",true)
         .attr("d", getTreePath())
         ;

    };

    /**
     * Returns the d="" attributes for the path object
     * resembling the tree
     */
    var getTreePath = function() {
        var d = "M 0 0 ";

        drawWalkthrough(
            function(joint, index){
                var previousBranchDirection = null;
                var currentBranchDirection = null;
                var perpendicularVector = null;
                var nbranches = joint.branches.length;

                //set up previous and current branches directions
                if(!joint.isLeaf()) {
                    if(joint.isRoot()) {
                        /*//root
                        if(index == 0){
                            previousBranchDirection = new Vec2(0,1);
                            currentBranchDirection = joint.branches[0].getVector().normalize().invert();
                        } else if (index == nbranches) {
                            previousBranchDirection = joint.branches[index-1].getVector().normalize().invert();
                            currentBranchDirection = new Vec2(0,1);
                        } else {
                            previousBranchDirection = joint.branches[index-1].getVector().normalize();
                            currentBranchDirection = joint.branches[index].getVector().normalize();
                        }*/
                    } else {
                        if(index == 0){
                            previousBranchDirection = joint.previousBranch.getVector().normalize().invert();
                            currentBranchDirection = joint.branches[0].getVector().normalize();
                        } else if (index == nbranches) {
                            previousBranchDirection = joint.branches[index-1].getVector().normalize();
                            currentBranchDirection = joint.previousBranch.getVector().normalize().invert();
                        } else {
                            previousBranchDirection = joint.branches[index-1].getVector().normalize();
                            currentBranchDirection = joint.branches[index].getVector().normalize();
                        }
                    }
                }

                var width = 5 - 5 * (joint.depth / _jointsSystem.getMaxDepth());
                var transVector = null;

                if(joint.isLeaf()){
                    //leaf
                    transVector = new Vec2(0,0);
                } else if (joint.isRoot()){
                    if(index == 0){
                        transVector = (new Vec2(-1,0)).mulS(width);
                    } else if (index == nbranches) {
                        transVector = (new Vec2(1,0)).mulS(width);
                    } else {
                        //XXX TODO
                    }
                } else {
                        //bisect normalize vector
                        var bisect = currentBranchDirection.bisect(previousBranchDirection);
                        transVector = bisect.mulS(width);
                }

                var pivotPos = joint.position.addV(transVector);
                //write attribute D
                d += " L" + pivotPos.x + " " + pivotPos.y;

            }
        );
        d += " z";
        return d;
    };


    var init = function () {
        _g = svg.append("g")
            .attr("transform", "translate(50,50) scale(1,1) rotate(180)");

        setUpPath(_g);
        setUpSkeleton(_g);
    }();
}