/**
 * Physic model for fixed joints tree-like systems
 */

function JointsSystem(root) {
    var self = this;

    var _root = root;

    self.getRoot = function() {
        return _root;
    };


    //Interactions
    var _jointDragged = null,
        _jointHtmlContainer = null,
        _mouseX = 0, _mouseY = 0;


    self.startDragging = function(joint, container) {
        _jointDragged = joint;
        _jointHtmlContainer = container
    };


    self.stopDragging = function() {
        _jointDragged.resetExternalForce();
        _jointDragged = _jointHtmlContainer = null;
    };


    self.updateMousePosition = function(x, y){
        _mouseX = x;
        _mouseY = y;
    };


    var _updateInteractions = function() {
        if(_jointDragged) {

            _jointDragged.addExternalForce((new Vec2(_mouseX - _jointDragged.position.x,
                    _mouseY - _jointDragged.position.y)).mulS(1.0));
        }
    };




   self.update = function(deltaTime) {

       //Reset
       self.recursiveWalk(
           function(joint){
                joint._reset();
           },
           function(){});

        //Force propagation
        self.recursiveWalk(
           function(joint){
               //force for make it follow the anchor
               if(joint.anchor != null && !_jointDragged) {
                   var force = (joint.anchor.getPosition().subV(joint.position).mulS(1));
                   joint.addExternalForce(force);
               }

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


       //Update interaction
       _updateInteractions();
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

   //from a joint to the root
   self.backwardWalk = function(jointCallback, currentJoint){
       jointCallback(currentJoint);
       if(!currentJoint.isRoot())
            self.backwardWalk(jointCallback, currentJoint.previousJoint());
   };



    var init = function(){
        //LITTLE
        /*    _root  = new Joint(new Vec2( 0,0));
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
            branchG = new Branch(jointE, jointG);*/




        //Update depths
        _root.depth = 0;
        self.recursiveWalk(
            function(joint){
                if(!joint.isRoot()){
                    joint.depth = joint.previousJoint().depth + joint.previousBranch.length;
                    //console.log(joint.depth);
                    //when a leaf is found, update the max depths
                    if(joint.isLeaf()){
                        self.backwardWalk(
                            function(j){
                                if(j.maxDepth < joint.depth){
                                    j.maxDepth = joint.depth;
                                }

                            }, joint);
                    }
                }
            },
            function(){});
    }();
}
