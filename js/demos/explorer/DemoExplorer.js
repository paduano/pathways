/**
 * DEMO PATHWAYS DemoExplorer
 */

function DemoExplorer (divContainer) {
    var self = this;

    var _running = false;
    var _loopInterval;

    var _width = 500,
        _height = 500;

    var _parser;

    //elements
    var _pathwayGraph;


    this.start = function() {
    };

    this.stop = function() {
    };


    //### helpers

    //### Set up functions

    var setUp = function() {


        var searchArea = SearchArea();
        var contextArea = ContextArea();



        var sideContainer = divContainer
            .append("div")
            .style("-webkit-user-select","none")
            .classed("demo-explorer-side-container", true);
        searchArea.appendTo(sideContainer);
        contextArea.appendTo(sideContainer);

        var svg = divContainer.append("div").classed("demo-explorer-visualization-area",true).append("svg");
        svg.attr("viewBox","0 0 800 600");
        svg.attr("preserveAspectRatio", "xMidYMid meet");
        svg.attr({
                x:0, y:0, width:"100%", height:"100%"}
        );

        //XXX
        _parser.pathways = _.without(_parser.pathways, _parser.pathways[0]);
        _parser.pathways = _.without(_parser.pathways, _parser.pathways[5]);

        _parser.pathways.forEach(function (p) {
            p._selected = true;
            contextArea.addContext(p);
        });


        _pathwayGraph = PathwaysGraph();
        _pathwayGraph.setDataset(
            _parser.proteins,
            _parser.complexes,
            _parser.reactions,
            _parser.pathways);


        _pathwayGraph.appendTo(svg);


        contextArea.onContextChange = function() {
            _pathwayGraph.updateContext();
        };

        searchArea.onFiltersChanged = function() {
            _pathwayGraph.updateFilters(searchArea.filters);
        }

        searchArea.addFilter("cyclin E/A:cdk2:p27/p21");
        searchArea.addFilter("rbl2:E2F4/5:DP1/2:cyclin E/A");


    };


    var loadAssets = function(callback) {
        //var request = d3.xml("immune-system.owl", "application/xml", function(d) {
        var request = d3.xml("resources/demos/owl/Rb-E2F1.owl", "application/xml", function(d) {
        //var request = d3.xml("resources/demos/owl/1_RAF-Cascade.owl", "application/xml", function(d) {
            _parser = BiopaxParser(d3.select(d));
            callback(null,null);
        });
    };

    var drawLoop = function() {
        //LOOP

        _loopInterval = setInterval(loop, 10);

        function loop( )
        {

        }
    };


    var init = function() {

        queue()
            //LOAD assets
            .defer(loadAssets)

            .await(function(){
                setUp();
            });

    } ();
}

//PARAMS
DemoExplorer.divContainer = true;
DemoExplorer.demoTitle = "Pathways Explorer";
DemoExplorer.demoDescription = "" ;
DemoExplorer.theme = "light-theme";