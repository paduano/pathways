
var demosController;

$(document).ready(function() {

    d3.ns.prefix.rdf = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
    //DEMOS CONTROLLER
    demosController = new DemosController([DemoPlainTree,DemoCircularTrees, DemoLineSet, DemoOverlappingRects, DemoComplexHierarchy, DemoCirclePacking]);

    var demoTitle = getParameterByName("demo") || DemoCirclePacking.demoTitle;

    demosController.setUpDemo(demoTitle);

});

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}