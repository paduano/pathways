/**
 * Physic model for fixed joints tree-like systems
 */

function JointsSystem() {
    var self = this;

    var _root;
    var _maxDepth = 0;

    self.getRoot = function() {
        return _root;
    };

    self.getMaxDepth = function () {
        return _maxDepth;
    };

   self.update = function(deltaTime) {

       //Reset
       //Force propagation
       self.recursiveWalk(
           function(joint){
                joint._reset();
           },
           function(){});

        //Force propagation
        self.recursiveWalk(
           function(joint){
               if(joint.hasExternalForce()){
                   //propagate backwards
                   joint._propagateForce(joint.externalForce);
              }
           },
           function(){});

        //rotation propagation
        self.recursiveWalk(
            function(joint){
                joint._update(deltaTime);
            },
            function(){});
   };

   self.recursiveWalk = function(jointCallback, branchCallback, currentJoint) {
       currentJoint = currentJoint || _root;
       jointCallback(currentJoint);
       currentJoint.branches.forEach(
           function(branch) {
               branchCallback(branch);
               self.recursiveWalk(jointCallback, branchCallback, branch.destinationJoint);
           }
       );
   };



    var init = function(){
            _root  = new Joint(new Vec2( 0,0));
        var jointA = new Joint(new Vec2( 0,15));
        var jointB = new Joint(new Vec2( -10,25));
        var jointC = new Joint(new Vec2( 10,25));
        var jointD = new Joint(new Vec2( 10,35));
        var jointE = new Joint(new Vec2( -10,35));
        var jointF = new Joint(new Vec2( -15,40));
        var jointG = new Joint(new Vec2( -5,40));

        var branchA = new Branch(_root, jointA),
            branchB = new Branch(jointA, jointB);
            branchC = new Branch(jointA, jointC);
            branchD = new Branch(jointC, jointD);
            branchE = new Branch(jointB, jointE);
            branchF = new Branch(jointE, jointF);
            branchG = new Branch(jointE, jointG);

        //Update depths
        _root.depth = 0;
        self.recursiveWalk(
            function(joint){
                if(!joint.isRoot()){
                    joint.depth = joint.previousJoint().depth + joint.previousBranch.length;
                    _maxDepth = joint.depth > _maxDepth ? joint.depth : _maxDepth;
                }
            },
            function(){});
    }();
}
