/**
 * Class which process a set of complexes and compute via genetic algorithm
 * the best planar representation
 *
 *
 */
var ComplexesPlanarLayout = function(complexes, width, height) {
    var self = ComplexesProcessor(complexes);

    self.width = width;
    self.height = height;
    self.layout = null;

    //# PUBLIC FUNCTIONS
    self.processLayout = function() {
        self.layout = generateRandomSolution();
    };


    /**
     * Evaluate the provided solution
     */
    self.evaluateSolution = function(solution) {
        var error = 0;
        self.forEachCoupleOfComplexes(solution, function(c1, c2) {
            var distance = c1.pos.subV(c2.pos).length();
            var closeness = self.closenessBetweenComplexes(c1.complex, c2.complex);
            if (closeness < distance) {
                error += distance - closeness;
            }
        });
        return error;
    };


    //# PRIVATE FUNCTIONS

    var crossingOver = function(solution1, solution2) {
        var splitPoint = Math.floor(Math.random() * solution1.length);
        var newSolution = solution1.slice(0, splitPoint).concat(solution2.slice(splitPoint, solution1.length));
        return newSolution;
    };

    var generateRandomSolution = function() {
        var solution = [];
        self.complexes.forEach(function(c) {
            solution.push({complex: c, pos: vec2(Math.random() * self.width, Math.random() * self.height)});
        });

        return solution;
    };



    var init = function() {
        self.processLayout();
    }();

    return self;
};