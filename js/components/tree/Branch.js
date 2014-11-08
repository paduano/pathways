function Branch(parentJoint, destinationJoint) {
    var self = this;

    self.destinationJoint = destinationJoint;
    self.parentJoint = parentJoint;
    self.length = undefined;
    self.rot = undefined;

    var _stretchFactor = 0.005;

    self.getVector = function() {
        return self.destinationJoint.position.subV(self.parentJoint.position);
    };

    self.extendLength = function(parallelForce) {
        self.length = self.length + parallelForce*_stretchFactor;
    };

    var init = function() {
        self.parentJoint.addBranch(self);
        destinationJoint.previousBranch = self;
        self.length = self.getVector().length();
        self.rot = self.getVector().getAngle();
    }();

}