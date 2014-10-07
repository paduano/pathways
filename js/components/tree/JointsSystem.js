/**
 * Physic model for fixed joints tree-like systems
 */

function JointsSystem() {
    var self = this;

    var _root;

    self.getRoot = function() {
        return _root;
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

   //from a joint to the root
   self.backwardWalk = function(jointCallback, currentJoint){
       jointCallback(currentJoint);
       if(!currentJoint.isRoot())
            self.backwardWalk(jointCallback, currentJoint.previousJoint());
   };



    var init = function(){
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


        _root  = new Joint(new Vec2( 0,0));
        var jointB = new Joint(new Vec2( 0,15));
        var jointC = new Joint(new Vec2( -5,25));
        var jointD = new Joint(new Vec2(-10,35));
        var jointE = new Joint(new Vec2( -15,40));
        var jointF = new Joint(new Vec2( -12,42));
        var jointG = new Joint(new Vec2( -7,40));
        var jointH = new Joint(new Vec2( -5,35));
        var jointI = new Joint(new Vec2( -5,40));
        var jointL = new Joint(new Vec2( -2,35));
        var jointM = new Joint(new Vec2( -2,40));

        var jointN = new Joint(new Vec2( 20,35));
        var jointO = new Joint(new Vec2( 20,42));
        var jointP = new Joint(new Vec2( 25,40));
        var jointQ = new Joint(new Vec2( 22,50));
        var jointR = new Joint(new Vec2( 30,48));
        var jointS = new Joint(new Vec2( 40,37));
        var jointT = new Joint(new Vec2( 44,40));
        var jointU = new Joint(new Vec2( 46,38));

        new Branch(_root, jointB);
        new Branch(jointB, jointC);
        new Branch(jointC, jointD);
        new Branch(jointD, jointE);
        new Branch(jointD, jointF);
        new Branch(jointD, jointG);
        new Branch(jointC, jointH);
        new Branch(jointH, jointI);
        new Branch(jointC, jointL);
        new Branch(jointL, jointM);

        new Branch(jointB, jointN);
        new Branch(jointN, jointO);
        new Branch(jointN, jointP);
        new Branch(jointP, jointQ);
        new Branch(jointP, jointR);
        new Branch(jointN, jointS);
        new Branch(jointS, jointT);
        new Branch(jointS, jointU);





        //Update depths
        _root.depth = 0;
        self.recursiveWalk(
            function(joint){
                if(!joint.isRoot()){
                    joint.depth = joint.previousJoint().depth + joint.previousBranch.length;
                    console.log(joint.depth);
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
