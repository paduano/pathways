
var demosController;

$(document).ready(function() {


    //DEMOS CONTROLLER
    demosController = new DemosController([DemoPlainTree,DemoCircularTrees, DemoComplex]);
    demosController.setUpDemo(DemoComplex.demoTitle);

});