function Branch(parentJoint, destinationJoint) {
    var self = this;

    self.destinationJoint = destinationJoint;
    self.parentJoint = parentJoint;
    self.length = undefined;
    self.rot = undefined;

    self.getVector = function() {
        return self.destinationJoint.position.subV(self.parentJoint.position);
    };

    var init = function() {
        self.parentJoint.addBranch(self);
        destinationJoint.previousBranch = self;
        self.length = self.getVector().length();
        self.rot = self.getVector().getAngle();
    }();

}