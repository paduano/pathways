/**
 * Joint data structure
 */
function Joint(position) {
    var self = this;

    var _hasExternalForce = false;

    self.branches = [];
    self.previousBranch = null;
    self.position = position;
    //sum of the length of the branches from root to here
    self.depth = undefined;
    //longest path passing through this joint
    self.maxDepth = 0;

    self.externalForce = new Vec2(0,0);
    self.momentum = 0.0;
    self.rotV = 0.0;
    self.rotA = 0.0;

    /**
     * Returns the ration between the deoth
     * and the maxDepth of the branch
     */
    this.getDepthRation = function() {
        return self.depth / self.maxDepth;
    };

    this.isRoot = function() {
        return this.previousBranch == null;
    };

    this.isLeaf = function() {
        return this.branches.length == 0;
    }

    this.previousJoint = function() {
        return this.previousBranch.parentJoint;
    };

    this.addBranch = function(branch){
        self.branches.push(branch);
    };

    this.addExternalForce = function(force) {
        self.externalForce = force;
        _hasExternalForce = true;
    };

    this.resetExternalForce = function() {
        _hasExternalForce = false;
        self.externalForce = new Vec2(0,0);
    };

    this.hasExternalForce = function() {
        return _hasExternalForce;
    };

    this._reset = function() {
        self.momentum = 0;
    };

    this._propagateForce = function(force) {

        //Root node
        if(self.previousBranch == null)
            return;

        var direction = self.previousBranch.getVector();
        direction.normalize();

        self.momentum += direction.cross(force) * self.previousBranch.length;

        var parallelForce = direction.mulS(force.dot(direction));

        self.previousBranch.parentJoint._propagateForce(parallelForce);

    };

    this._update = function(deltaTime) {

        //Root node
        if(self.previousBranch == null)
            return;

        self.rotA = self.momentum * 0.1;

        self.rotV += self.rotA * deltaTime;

        var rotAngle = self.rotV * deltaTime;
        //update position

        self.previousBranch.rot += rotAngle;
        var newDirection = (new Vec2(1,0)).rot(self.previousBranch.rot).mulS(self.previousBranch.length);

        self.position = self.previousBranch.parentJoint.position.addV(newDirection);

        //friction TEMP TODO
        var rotSign =  self.rotA?self.rotA<0?-1:1:0;
        self.rotV -= self.rotV * deltaTime * 5;
    }
}