function TreeRender(svg, jointsSystem) {
    var self = this;
    var _jointsSystem = jointsSystem;
    var _drawWholeSkeleton = false;
    var _svg = svg,
        _g = null,
        treePath = null;

    /**
     * Draw the skeleton
     */
    this.drawSekeleton = function() {
        var updateJoint = function(joint) {
            if(_drawWholeSkeleton || joint.isLeaf()){
                joint.svgCircle
                    .attr("cx", joint.position.x)
                    .attr("cy", joint.position.y);
            }

        };

        var updateBranch = function(branch) {
            if(_drawWholeSkeleton) {
                branch.svgLine
                    .attr("x1", branch.parentJoint.position.x)
                    .attr("y1", branch.parentJoint.position.y)
                    .attr("x2", branch.destinationJoint.position.x)
                    .attr("y2", branch.destinationJoint.position.y);
            }
        };

        _jointsSystem.recursiveWalk(updateJoint, updateBranch);

    };

    /**
     * Draw Path
     */
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
            if(_drawWholeSkeleton || joint.isLeaf()) {
                var drag = d3.behavior.drag()
                    .on("dragstart", function () {

                    })
                    .on("drag", function () {

                        joint.addExternalForce(new Vec2(d3.event.x - joint.position.x,
                                d3.event.y - joint.position.y));
                    })
                    .on("dragend", function () {
                        joint.resetExternalForce();
                    });


                joint.svgCircle = g.append("circle")
                    .classed("tree-joint", true)
                    .attr("cx", joint.position.x)
                    .attr("cy", joint.position.y)
                    .attr("r", 2)
                    .call(drag);
            }
        };

        var buildBranch = function(branch) {
                if(_drawWholeSkeleton){
                    branch.svgLine = g.append("line")
                        .classed("tree-line", true)
                        .attr("x1",branch.parentJoint.position.x)
                        .attr("y1",branch.parentJoint.position.y)
                        .attr("x2",branch.destinationJoint.position.x)
                        .attr("y2",branch.destinationJoint.position.y);
                }

            };

        _jointsSystem.recursiveWalk(buildJoint, buildBranch);

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
        var previousPivotPoint = null;
        var previousWasPerimetralJoint = false;

        function writeAttribute(pivot , mode, handle, firstHandlePosition){
            if (mode == "line") {
                return " L"
                    + pivot.x + " " + pivot.y;
            } else if (mode == "smooth") {
                return  " S"
                    + handle.x + " " + handle.y + " "
                    + pivot.x + " " + pivot.y;
            } else if (mode == "curve") {
                return  " C"
                    + firstHandlePosition.x + " " + firstHandlePosition.y + " "
                    + handle.x + " " + handle.y + " "
                    + pivot.x + " " + pivot.y;
            }
        }

        drawWalkthrough(
            function(joint, index){
                var previousBranchDirection = null;
                var currentBranchDirection = null;
                var bisectionPreviousCurrentBranch = null;
                var nbranches = joint.branches.length;
                //whether the joint is not in between two branches, but along one
                var isPerimeterJoint = (index == 0 || index == nbranches);
                var lineMode = "line";

                /** PIVOT **/
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

                var width = 5 - 5 * (joint.depth / joint.maxDepth);
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
                        //XXX TODO MULTIPLE BRANCHES RIGHT ON THE ROOT
                    }
                } else {
                        //bisect normalize vector
                        bisectionPreviousCurrentBranch = currentBranchDirection.bisect(previousBranchDirection);
                        transVector = bisectionPreviousCurrentBranch.mulS(width);
                }

                var pivotPos = joint.position.addV(transVector);


                /**  HANDLE **/
                var handlePosition = null;
                //used onle on 'curve' mode
                var firstHandlePosition = null;

                if(joint.isLeaf()){
                    //leaf

                } else if (joint.isRoot()){
                    handlePosition = pivotPos;
                    lineMode = "smooth";
                } else {
                    var handleLength = 5 - 5 * (joint.depth / joint.maxDepth);
                    var intraBranchesAngle = 0.5;

                    if(isPerimeterJoint){
                        handlePosition = pivotPos.addV(
                            bisectionPreviousCurrentBranch.clone()
                                .perpendicular()
                                .normalize()
                                .mulS(-handleLength));

                        if(!previousWasPerimetralJoint){
                            //intra branches, leaving the joint
                            firstHandlePosition = previousPivotPoint.addV(
                                previousBranchDirection.clone()
                                                       .invert()
                                                       .rot(-intraBranchesAngle)
                                                       .mulS(handleLength)
                            );
                            lineMode = "curve";
                        } else {
                            lineMode = "smooth";
                        }

                    } else {
                        //Intra branches
                        handlePosition = pivotPos.addV(
                            previousBranchDirection.clone()
                                                   .rot(intraBranchesAngle)
                                                   .mulS(handleLength)
                        );

                        lineMode = "smooth";
                    }

                }

                //Write results
                d += writeAttribute(pivotPos, lineMode, handlePosition, firstHandlePosition);

                //Variables available next joint
                previousPivotPoint = pivotPos;
                previousWasPerimetralJoint = isPerimeterJoint;
            }
        );

        d += " z";
        return d;
    };

    /**
     * Init function
     */
    var init = function () {
        _g = svg.append("g")
            .attr("transform", "translate(0,0) scale(1,1) rotate(180)");

        setUpPath(_g);
        setUpSkeleton(_g);
    }();
}