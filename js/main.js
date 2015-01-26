
var demosController;

$(document).ready(function() {

    d3.ns.prefix.rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
    //DEMOS CONTROLLER
    demosController = new DemosController([DemoPlainTree,DemoCircularTrees, DemoLineSet, DemoOverlappingRects]);
    demosController.setUpDemo(DemoLineSet.demoTitle);

});