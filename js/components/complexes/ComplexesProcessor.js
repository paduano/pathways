/**
 * Class which process a set of complexes offering a set of
 * high level operation on them
 */
var ComplexesProcessor = function(complexes) {
    var self = [];
    var _debug = true;

    self.complexes = complexes;

    var _precalculatedClosenessPairs = [];
    //# PUBLIC FUNCTIONS

    /**
     * Performs hierarchical clustering
     */
    self.processHierarchicalClustering = function() {
        //%% Why complete linkage? I don't want to consider close groups which have very different elements
        self.hierarchicalClustering = clusterfck.hcluster(self.complexes, self.closenessBetweenComplexes, clusterfck.COMPLETE_LINKAGE);
    };

    self.processClosenessPairs = function(threshold) {
        _precalculatedClosenessPairs = [];
        self.forEachCoupleOfComplexes(self.complexes, function(c1, c2) {
            var closeness = self.closenessBetweenComplexes(c1, c2);
            if(closeness >= threshold)
                _precalculatedClosenessPairs.push({c1:c1, c2:c2, closeness:closeness});
        });
        if(_debug)console.log("Process " + _precalculatedClosenessPairs.length + " in the closeness list");
    };

    /**
     * Build a list of pair complexes based on the closeness
     */
    self.processClosenessList = function() {
        var closeness = [];

        for(var c1 in self.complexes){
            for(var c2 in self.complexes){
                if(c1 < c2){
                    var complex1 = self.complexes[c1];
                    var complex2 = self.complexes[c2];

                    var c = self.closenessBetweenComplexes(complex1, complex2);
                    if(c > 0){
                        closeness.push({complex1:complex1, complex2:complex2, closeness:c});
                    }

                }
            }
        }

        self.closenessList = _.sortBy(closeness, function(o){return o.closeness}).reverse();

    };

    /**
     * For each couple
     */
    self.forEachCoupleOfComplexes = function(complexes, callback) {
        for(var c1 in complexes){
            for(var c2 in complexes){
                if(c1 < c2){
                    var complex1 = complexes[c1];
                    var complex2 = complexes[c2];
                    callback(complex1,complex2);
                }
            }
        }
    };


    /**
     *
     */
    self.forEachCoupleOfCloseComplexes = function(callback) {
        _precalculatedClosenessPairs.forEach(function(p){
           callback(p.c1, p.c2, p.closeness);
        });
    };

    /**
     * Build the list of unique elements
     */
    self.processElementsList = function() {
        self.elements = [];
        self.complexes.forEach(function(c){
            self.elements = self.elements.concat(c.elements);
        });
        //make it unique
        self.elements = self.elements.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })
    };

    /**
     *
     * @param c1
     * @param c2
     * @returns {Number}
     */
    self.closenessBetweenComplexes = function(c1, c2) {
        var intersection = c1.elements.filter(function(n) {
            return c2.elements.indexOf(n) != -1
        });
        return intersection.length;
    };

    //# PRIVATE FUNCTIONS


    var init = function() {
        for(var i in self.complexes){
            self.complexes[i].arrayPosition = i;
        }

        self.processHierarchicalClustering();
        self.processClosenessList();
    }();

    return self;
};