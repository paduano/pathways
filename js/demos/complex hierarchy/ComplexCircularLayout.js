ComplexCircularLayout = function(complex, interComplexSpace, minLevelSpace) {
    var self = {};

    //a level of nodes of the same tree can't be wider than that
    var angleSpanThreshold = 160;

    var _radiusAtDeep = [];

    var _mainComplex = complex,
        _interComplexSpace = interComplexSpace;

    self.externalRadius = 0;
    self.proteinRadius = 0;



    var toRad = function(degrees) {return degrees * Math.PI / 180;};

    var filterComplex = function(list){return list.filter(function(e){return e.type == "complex"})};

    //calculate the angle range for each subelement
    var computeAngles = function(elements, startAngle, endAngle, startDeep){
        if(elements.length == 0)return startDeep - 1;

        var angleSpan = Math.abs(endAngle - startAngle);
        var weights = _.map(elements, function(e){return computeWeightForBranch(e,1)});
        var weightsSum = _.reduce(weights, function(memo, w){return memo + w;});

        var maxDeep = startDeep;

        var currentAngle = startAngle;
        for(var i = 0; i < elements.length; i++){
            var e = elements[i];
            e._deep = startDeep;
            e._startAngle = currentAngle;
            var weightedAngleSpan = angleSpan * (weights[i]/weightsSum);

            if(startDeep > 0 && weightedAngleSpan > angleSpanThreshold){
                weightedAngleSpan = angleSpanThreshold;
            }

            currentAngle += weightedAngleSpan;
            e._endAngle = currentAngle;

            var elementComplexes = filterComplex(e.components);
            e._arcDensity = 1/Math.abs(e._endAngle - e._startAngle);
            maxDeep = Math.max(maxDeep, computeAngles(elementComplexes, e._startAngle, e._endAngle, startDeep + 1));
        }

        return maxDeep;

    };

    //should be called only once. Maybe
    var computeWeightForBranch = function(element, deep){
        deep = deep || 1;

        var complexes = filterComplex(element.components);

        if(complexes.length == 0)
            return 1;

        var deepWeight =  Math.pow(complexes.length, deep);

        complexes.forEach(function(c){
            deepWeight = Math.max(deepWeight, computeWeightForBranch(c, deep + 1));
        });

        return deepWeight;
    };


    var findMostDenseComponent = function() {
        return _.max(_mainComplex.allComplexes, function(c){return c._arcDensity});
    };

    var findMostDenseComponentAtDeep = function(deep) {
        var candidates = _mainComplex.allComplexes.filter(function(e){return e._visible == true && e._deep == deep});
        if(candidates.length == 0)
            return null;
        return _.max(candidates, function(c){return c._arcDensity});
    };


    var findDeeperVisibleComponent = function() {
        return _.max(_mainComplex.allComplexes.filter(function(e){return e._visible == true}),
            function(c){return c._deep});
    };


    var findMostDenseVisibleComponent = function(deep) {
        var candidates = _mainComplex.allComplexes.filter(function(e){return e._visible == true && e._deep == deep});
        if(candidates.length == 0)
            return null;
        else return _.max(candidates, function(c){return c._arcDensity});
    };


    //compute the radius from the most dense arc
    var computeRadius = function(arcAngle, numberOfNodes){
        return (numberOfNodes * _interComplexSpace) / toRad(arcAngle);
    };


    var assignPositions = function(){
        _mainComplex.allComplexes.forEach(function (c) {
            var avgAngle = toRad(c._startAngle + ((c._endAngle - c._startAngle) / 2));
            var r = _radiusAtDeep[c._deep]//totalRadius / ((maxDeep + 1) / (maxDeep + 1 - c._deep));
            var x = Math.cos(avgAngle) * r,
                y = Math.sin(avgAngle) * r;

            c._x = x;
            c._y = y;
        });
    };


    self.computeLayout = function(){
        _mainComplex._deep = 0;

        var maxDeep = computeAngles([_mainComplex], 0, 360, 0);

        var lastRadius = 0;

        for(var deep = maxDeep; deep >= 0 ; deep--){
            var mostDenseComponent = findMostDenseComponentAtDeep(deep);

            var innerRadius = 0;
            if(mostDenseComponent != null){
                //inner radius at a given deep
                innerRadius = computeRadius(Math.abs(mostDenseComponent._endAngle - mostDenseComponent._startAngle), 1);
            }

            if(innerRadius < lastRadius + minLevelSpace){
                innerRadius = lastRadius + minLevelSpace;
            }
            lastRadius = innerRadius;

            _radiusAtDeep.unshift(innerRadius);
        }

        //radius 0
        _radiusAtDeep.unshift(lastRadius + minLevelSpace);

        //
        //var totalRadius = innerRadius * ((maxDeep + 1) / (maxDeep + 1 - mostDenseComponent._deep));
        //
        //var minRadius = (maxDeep + 1) * minLevelSpace;
        //totalRadius = totalRadius < minRadius? minRadius : totalRadius;

        assignPositions();
        self.externalRadius = _radiusAtDeep[0];

    };


    self.computeVisibleLayout = function(){
        //duplicated code
        _mainComplex._deep = 0;

        computeAngles([_mainComplex], 0, 360, 0);
        var maxDeep = findDeeperVisibleComponent()._deep;

        var lastRadius = 0;

        for(var deep = maxDeep; deep >= 0 ; deep--){
            var mostDenseComponent = findMostDenseComponentAtDeep(deep);

            var innerRadius = 0;
            if(mostDenseComponent != null){
                //inner radius at a given deep
                innerRadius = computeRadius(Math.abs(mostDenseComponent._endAngle - mostDenseComponent._startAngle), 1);
            }

            if(innerRadius < lastRadius + minLevelSpace){
                innerRadius = lastRadius + minLevelSpace;
            }
            lastRadius = innerRadius;

            _radiusAtDeep.unshift(innerRadius);
        }

        //radius 0
        _radiusAtDeep.unshift(lastRadius + minLevelSpace);

        //
        //var totalRadius = innerRadius * ((maxDeep + 1) / (maxDeep + 1 - mostDenseComponent._deep));
        //
        //var minRadius = (maxDeep + 1) * minLevelSpace;
        //totalRadius = totalRadius < minRadius? minRadius : totalRadius;

        assignPositions();
        self.externalRadius = _radiusAtDeep[0];
    };

    //get the radius considering only the visible elements {_visible}
    //self.computeVisibleLayout = function(){
    //    _mainComplex._deep = 0;
    //    computeAngles([_mainComplex], 0, 360, 0);
    //    var maxDeep = findDeeperVisibleComponent()._deep;
    //
    //
    //
    //    for(var i = maxDeep; i > 0; i--){
    //        var mostDenseComponent = findMostDenseVisibleComponent(i);
    //    }
    //
    //
    //
    //    //inner radius at a given deep
    //    var innerRadius = computeRadius(Math.abs(mostDenseComponent._endAngle - mostDenseComponent._startAngle), 1);
    //    var totalRadius = innerRadius * ((maxDeep + 1) / (maxDeep + 1 - mostDenseComponent._deep));
    //
    //    var minRadius = (maxDeep + 1) * minLevelSpace;
    //    totalRadius = totalRadius < minRadius? minRadius : totalRadius;
    //
    //    assignPositions(totalRadius, maxDeep);
    //    self.externalRadius = totalRadius;
    //};


    var init = function() {
        self.computeLayout();
    }();

    return self;
};