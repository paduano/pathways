
var demosController;

$(document).ready(function() {


    //DEMOS CONTROLLER
    demosController = new DemosController([DemoPlainTree,DemoCircularTrees]);
    demosController.setUpDemo(DemoPlainTree.demoTitle);

});