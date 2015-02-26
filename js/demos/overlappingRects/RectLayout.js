function RectLayout(distanceFactor) {
    var self = {};

    var rects = [];
    self.rects = rects;

    self.addFixedRectangle = function(r){
        rects.push(r);
    };

    self.addRectangle = function(r){
        var newX = r.x,newY = r.y;

        var intersects = [];
        for(var i = 0; i < rects.length; i++){
            var rect = rects[i];
            if(rect.overlappingArea(r) >= 0){//XXX
                intersects.push(rect);
            }
        }

        if(intersects.length > 0){
            var xShiftProfile = [], yShiftProfile = [];
            intersects.forEach(function(intersectingRect){
                xShiftProfile = _.sortBy(xShiftProfile.concat(getXShiftProfile(r, intersectingRect)), function(d){return d.shift});
                yShiftProfile = _.sortBy(yShiftProfile.concat(getYShiftProfile(r, intersectingRect)), function(d){return d.shift});
            });

            var sumXProfile = [{shift: xShiftProfile[0].shift, value: distanceFactor * Math.abs(xShiftProfile[0].shift)}];
            var sumYProfile = [{shift: yShiftProfile[0].shift, value: distanceFactor * Math.abs(yShiftProfile[0].shift)}];

            var slopeX = xShiftProfile[0].value, slopeY = yShiftProfile[0].value;
            var valueX = 0, valueY = 0;
            for(var i = 1; i < xShiftProfile.length; i++){

                var currentX = xShiftProfile[i],
                    currentY = yShiftProfile[i];
                var previousX = xShiftProfile[i-1],
                    previousY = yShiftProfile[i-1];


                valueX = valueX + slopeX * (currentX.shift - previousX.shift);
                sumXProfile.push({shift: currentX.shift, value:valueX + distanceFactor * Math.abs(currentX.shift)});
                slopeX += currentX.value;

                valueY = valueY + slopeY * (currentY.shift - previousY.shift);
                sumYProfile.push({shift: currentY.shift, value:valueY + distanceFactor * Math.abs(currentY.shift)});
                slopeY += currentY.value;
            }

            var minX = _.min(sumXProfile, function(v){return v.value});
            var minY = _.min(sumYProfile, function(v){return v.value});

            if(minX.value < minY.value){
                newX += minX.shift;
            } else {
                newY += minY.shift;
            }
        }



        var newRect = rect2d(newX, newY, r.width, r.height);
        rects.push(newRect);

        r.x = newX;
        r.y = newY;

        return newRect;
        

    };


    //how the overlapping change according to the shift on the X axis
    var getXShiftProfile = function(rectA, rectB){
        // B is fixed
        var points = [0,0,0,0];
        var yOverlap = Math.max(0, Math.min(rectA.y + rectA.height, rectB.y + rectB.height) - Math.max(rectA.y, rectB.y)) * rectB.density;

        points[0] = rectB.x - (rectA.x + rectA.width);
        points[1] = points[0] + Math.min(rectA.width, rectB.width);
        points[2] = points[1] + Math.abs(rectA.width - rectB.width);
        points[3] = rectB.x + rectB.width - rectA.x;

        var profile = [];
        var slope = yOverlap / (points[1] - points[0]);

        for(var i = 0; i < 4; i++){
            var value;
            if(i == 0)
                value = slope;
            else if(i == 1)
                value = -slope;
            else if(i == 2)
                value = -slope;
            else if(i == 3)
                value = slope;
            profile.push({shift:points[i], value: value});
        }

        return profile;
    };


    //how the overlapping change according to the shift on the Y axis
    var getYShiftProfile = function(rectA, rectB){
        // B is fixed
        var points = [0,0,0,0];
        var xOverlap = Math.max(0, Math.min(rectA.x + rectA.width, rectB.x + rectB.width) - Math.max(rectA.x, rectB.x)) * rectB.density;

        points[0] = rectB.y - (rectA.y + rectA.height);
        points[1] = points[0] + Math.min(rectA.height, rectB.height);
        points[2] = points[1] + Math.abs(rectA.height - rectB.height);
        points[3] = rectB.y + rectB.height - rectA.y;

        var profile = [];
        var slope = xOverlap / (points[1] - points[0]);

        for(var i = 0; i < 4; i++){
            var value;
            if(i == 0)
                value = slope;
            else if(i == 1)
                value = -slope;
            else if(i == 2)
                value = -slope;
            else if(i == 3)
                value = slope;
            profile.push({shift:points[i], value: value});
        }

        return profile;
    };


    var init = function() {

    }();


    return self;
}