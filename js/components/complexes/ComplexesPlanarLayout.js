/**
 * Class which process a set of complexes and compute via genetic algorithm
 * the best planar representation
 *
 *
 */
var ComplexesPlanarLayout = function(complexes, width, height) {

    var self = ComplexesProcessor(complexes);
    self.__proto__ = SvgViewController();

    self.width = width;
    self.height = height;

    self.complexesView = [];

    //# PUBLIC FUNCTIONS
    self.processLayout = function() {
        generateRandomSolution();


    };

    self.test = function(steps) {
        self.processClosenessPairs(0);
        var dt = 0.1;

        for(var i = 0; i < steps; i++){
            self.gradientStep(dt);
            console.log(i);
        }

        console.log(self.evaluateSolution());
    };

    self.gradientStep = function(dt) {
        evaluateGradient();
        moveAlongGradient(dt);
    };


    /**
     * Evaluate the provided solution
     */
    self.evaluateSolution = function() {
        var error = 0;
        self.forEachCoupleOfCloseComplexes(function(c1, c2, closeness) {
            var distance = c1.view.pos.subV(c2.view.pos).length();
            /*if (closeness < distance) {
                error += distance - closeness;
            }*/
            error += Math.abs(errorBetweenTwoComplexes(distance, closeness, c1.view.radius, c2.view.radius));
        });
        return error;
    };


    var errorBetweenTwoComplexes = function(distance, closeness, radius1, radius2) {
        return distance - (width/2)/(1+closeness) - radius1 - radius2;
    };


    var generateRandomSolution = function() {
        var solution = {};
        solution.alleles = [];
        self.complexes.forEach(function(c) {
            c.view.pos = vec2(-self.width*0.5 + Math.random() * self.width*0.5,
                            -self.height*0.5 + Math.random() * self.height*0.5);
        });

        return solution;
    };

    //STEPS
    var evaluateGradient = function() {

        //set all gradients to zero
        self.complexes.forEach(function(c){
            c.gradient = vec2(0,0);
        });

        self.forEachCoupleOfCloseComplexes(function(c1, c2, closeness) {
            var direction = c1.view.pos.subV(c2.view.pos);
            var distance = c1.view.pos.subV(c2.view.pos).length();

            var error = errorBetweenTwoComplexes(distance, closeness, c1.view.radius, c2.view.radius) * 0.1;

            var gradient = direction.normalize().mulS(error);
            c2.gradient = c2.gradient.addV(gradient);
            c1.gradient = c1.gradient.addV(gradient.invert());
        });
    };


    var moveAlongGradient = function(dt) {
        self.complexes.forEach(function(c){
            c.view.pos = c.view.pos.addV(c.gradient.mulS(dt));
        });
    };


    var getComplexesRadius = function(c) {
        return 1 + Math.log(c.elements.length+1);
    };



    var init = function() {
        var complexesGroup = UIGView();
        complexesGroup.pos = vec2(200,140);

        self.complexes.forEach(function(c){
            var v = ComplexView();
            v.radius = getComplexesRadius(c);
            complexesGroup.append(v);
            c.view = v;
        });

        self.view.append(complexesGroup);

       self.processLayout();


    }();

    return self;
};