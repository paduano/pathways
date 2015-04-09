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

        var visualizationArea = divContainer.append("div")
            .classed("demo-explorer-visualization-area",true);
        var svg = visualizationArea.append("svg");
        svg.attr("viewBox","0 0 800 600");
        svg.attr("preserveAspectRatio", "xMidYMid meet");
        svg.attr({
                x:0, y:0, width:"100%", height:"100%"}
        );


        _parser.pathways.forEach(function (p) {
            contextArea.addContext(p);
        });

        contextArea.selectOnlyFirstRoots(3);



        contextArea.collapseAll();

        _pathwayGraph = PathwaysGraph();
        _pathwayGraph.setDataset(
            _parser.proteins,
            _parser.complexes,
            _parser.reactions,
            _parser.pathways);


        _pathwayGraph.appendTo(svg);

        Legenda(visualizationArea);



        contextArea.onContextChange = function() {
            _pathwayGraph.updateContext();
        };

        searchArea.onFiltersChanged = function() {
            _pathwayGraph.updateFilters(searchArea.filters);
        };

        //searchArea.addFilter("cyclin E/A:cdk2:p27/p21");
        searchArea.addFilter("prerc");
        searchArea.addFilter("ubiquitin");

    };


    var loadAssets = function(callback) {

        _parser = BiopaxParser();
        var owlQueue = queue();

        [
            "Mitotic-G1-G1-S-phase.owl",
            "S-phase.owl",
            "Regulation-of-DNA-replication.owl",
            "Mitotic-G2-G2-M-phases.owl",
            "M-phase.owl",
            "M-G1-transition.owl"
        ].forEach(function (owl) {
            owlQueue.defer(function(nestedCallback) {
                var request = d3.xml("resources/demos/owl/yao/" + owl, "application/xml", function (d) {
                    _parser.loadBiopax(d3.select(d));
                    nestedCallback(null, null);
                });
            })
        });

        owlQueue.await(function () {
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