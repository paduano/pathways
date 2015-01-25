/**
 * Class which process a set of complexes and compute via genetic algorithm
 * the best planar representation
 *
 *
 */
var ComplexesPlanarLayoutGenetic = function(allComplexes, width, height) {

    var proc = ComplexesProcessor(allComplexes);
    var complexes = [];
    proc.closenessList.forEach(function(c){
        if(c.closeness > 0){
            if(complexes.indexOf(c.complex1) == -1)
                complexes.push(c.complex1);
            if(complexes.indexOf(c.complex2) == -1)
                complexes.push(c.complex2);
        }

    });
    console.log("only " + complexes.length);
    var self = ComplexesProcessor(complexes);

    self.width = width;
    self.height = height;
    self.layout = null;

    //PARAMETERS
    self.survivorsNumber = 50;
    self.generationSize = 200;
    self.maxIterations = 2000;
    self.numberOfMutation = 1000;
    self.eliteNumbers = 10;

    self.solutions = [];

    var _currentIteration = 0;

    //# PUBLIC FUNCTIONS
    self.processLayout = function() {

        initialization(self.generationSize);


        while(!stopConditions()){
            var newSolutions = [];
            for(var i = 0; i < self.eliteNumbers; i++){
                newSolutions.push(cloneSolution(self.solutions[i]));
            }

            for(var i = 0; i < self.numberOfMutation; i++){
                addMutation(pickUpRandomSolution());
            }


            for(var i = 0; i < self.generationSize; i++){
                var s1 = pickUpRandomSolution();
                var s2 = pickUpRandomSolution();
                newSolutions.push(crossingOver(s1,s2));
            }


            self.solutions = selection(newSolutions, self.generationSize);


            self.solutions.slice(0, 5).forEach(function(s){
                console.log("solutions: " + s.evaluation);
            });
            console.log("----------");


            _currentIteration++;
        }

    };


    /**
     * Evaluate the provided solution
     */
    self.evaluateSolution = function(solution) {
        var error = 0;
        self.forEachCoupleOfCloseComplexes(function(c1, c2, closeness) {
            var sc1 = solution.alleles[c1.arrayPosition];
            var sc2 = solution.alleles[c2.arrayPosition];
            var distance = sc1.pos.subV(sc2.pos).length();
            /*if (closeness < distance) {
                error += distance - closeness;
            }*/
            error += Math.abs(distance - width/(1+closeness));
        });
        return error;
    };


    //# PRIVATE FUNCTIONS
/*
    var crossingOver = function(solution1, solution2) {

        var splitPoint = Math.floor(Math.random() * solution1.length);
        var newSolution = {};
        var combinedAlleles = solution1.alleles.slice(0, splitPoint).concat(solution2.alleles.slice(splitPoint, solution1.length));
        newSolution.alleles = [];
        combinedAlleles.forEach(function(allele){
            newSolution.alleles.push({complex: allele.complex, pos: allele.pos.clone()});
        });

        return newSolution;
    };
*/
    var crossingOver = function(solution1, solution2) {
        var newSolution = {};

        newSolution.alleles = [];
        for(var i = 0; i < solution1.alleles.length; i++){
            if(Math.random() <= 0.5){
                newSolution.alleles.push(solution1.alleles[i]);
            } else {
                newSolution.alleles.push(solution2.alleles[i]);
            }
        }
        return cloneSolution(newSolution);
    };


    var selection = function(solutions, survivorsNumber) {
        if(survivorsNumber > solutions.length){
            return solutions;
        }

        solutions.forEach(function(solution){
            var evaluation = self.evaluateSolution(solution);
            solution.evaluation = evaluation;
        });

        solutions = _.sortBy(solutions, function(s){return s.evaluation;});

        return solutions.slice(0, survivorsNumber);
    };


    var cloneSolution = function(solution) {
        var newSolution = {alleles: []};
        solution.alleles.forEach(function(allele){
            newSolution.alleles.push({complex: allele.complex, pos: allele.pos.clone()});
        });
        return newSolution;
    };


    var generateRandomSolution = function() {
        var solution = {};
        solution.alleles = [];
        self.complexes.forEach(function(c) {
            solution.alleles.push({complex: c, pos: vec2(Math.random() * self.width, Math.random() * self.height)});
        });

        return solution;
    };

    var addMutation = function(solution) {
        var alleleIndex = Math.floor(Math.random() * solution.alleles.length);
        var allele = solution.alleles[alleleIndex];
        solution.alleles[alleleIndex] = {};
        solution.alleles[alleleIndex].complex = allele.complex;
        solution.alleles[alleleIndex].pos = vec2(Math.random() * self.width, Math.random() * self.height);
    };


    var initialization = function(generationSize){
        self.solutions = [];
        for(var i = 0; i < generationSize; i++){
            self.solutions.push(generateRandomSolution());
        }
    };

    var stopConditions = function() {
        if(_currentIteration > self.maxIterations){
            return true;
        } else return false;
    };


    var pickUpRandomSolution = function() {
        return self.solutions[Math.floor(Math.random()*self.solutions.length)];
    };



    var init = function() {
       // self.processLayout();
    }();

    return self;
};