function rect2d(x ,y, width, height) {

    var self = {
        x: x,
        y: y,
        width: width,
        height: height,
        density: 1
    };

    self.overlappingArea = function(rect){
        var x_overlap = Math.max(0, Math.min(self.x + self.width, rect.x + rect.width) - Math.max(self.x, rect.x));
        var y_overlap = Math.max(0, Math.min(self.y + self.height, rect.y + rect.height) - Math.max(self.y, rect.y));

        return x_overlap * y_overlap;
    };

    self.center = function(){
        return {x: self.x + self.width/2, y: self.y + self.height/2};
    };

    return self;
}