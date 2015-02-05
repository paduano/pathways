/**
 * DEMO
 */



function DemoCirclePacking (containerSvg) {

    var eventDispatch = d3.dispatch(
        "pathwaysSelectionChanged"
    );

    var self = this;

    var _parser;

    var _running = false;
    var _loopInterval;

    var _mainComplex;

    var svg = containerSvg;

    var _width = 500,
        _height = 500;


    this.start = function() {
    };

    this.stop = function() {
    };


    //### helpers

    //### Set up functions

    var setUp = function() {

        svg.attr("viewBox","0 0 600 600");
        svg.attr("preserveAspectRatio", "xMidYMid meet");
        svg.attr({
            x:0, y:0, width:"100%", height:"100%"}
        );

        var svgComplexStructure = svg.append("svg").attr("viewBox","0 0 600 600").attr({
                x:300, y:20, width:"100%", height:"100%"}
        );

        var mainG = svg.append("g").attr("transform","translate(300,300)");

        var complexNode = mainG.selectAll(".main-complex").data([_mainComplex]);

        complexNode.enter().append("g").each(function(complex, i){
            complex._expanded = false;
            complex._color = Colors.pathways[i];
        }).call(ComplexPack, svgComplexStructure);

    };


    var update = function(){


    };


    var loadAssets = function(callback) {
        var request = d3.xml("resources/demos/owl/Rb-E2F1.owl", "application/xml", function(d) {
            _parser = BiopaxParser(d3.select(d));
            window.parser = _parser;//


            //fake main complex
            _mainComplex = _parser.complexes[59]//createDummyComplex([10,8,3], 1);
            _mainComplex.x = _width/2;
            _mainComplex.y = _height/2;
            window.c = _mainComplex;

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
DemoCirclePacking.demoTitle = "Circle Packing";
DemoCirclePacking.demoDescription = "" ;
DemoCirclePacking.theme = "dark-theme";