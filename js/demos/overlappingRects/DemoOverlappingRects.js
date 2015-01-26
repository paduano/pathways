/**
 * DEMO
 */

var eventDispatch = d3.dispatch(
    "pathwaysSelectionChanged"
);

function DemoOverlappingRects (containerSvg) {
    var self = this;

    var _parser;

    var _running = false;
    var _loopInterval;

    var svg = containerSvg;

    var _rectLayout = RectLayout(0.2);

    var _width = 500,
        _height = 500;

    var _pathwaysPath;

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


        svg.append("text")
            .text("add rect")
            .attr({
                x: 10,
                y: 20,
                "text-decoration" : "underline",
                cursor: "pointer"
            }).on("click", addRect);

        addRect();
        addRect();
        addRect();

    };

    var rects = [
        rect2d(0, 100,100, 100),
        rect2d(110, 100,90, 200),
        rect2d(90, 100,30, 200)
    ], i=0;


    var addRect = function() {
        var rect = rect2d(Math.random() * _width, Math.random() *_height,
            30 + Math.random() * 80, 30 + Math.random() * 80 );
        //var rect = rects[i];
        var newRect = _rectLayout.addRectangle(rect2d(rect.x,rect.y,rect.width,rect.height));
        i++;

        svg.append("rect")
            .attr({
                x:rect.x,
                y:rect.y,
                width:rect.width,
                height:rect.height,
                fill:"none",
                "stroke": "black",
                "stroke-width": 2
            }).transition().duration(1000)
            .attr({
                x:newRect.x,
                y:newRect.y,
                width:newRect.width,
                height:newRect.height,
                fill:"none",
                "stroke": "black",
                "stroke-width": 2
            })

    };


    var loadAssets = function(callback) {
        callback(null,null);

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
DemoOverlappingRects.demoTitle = "Overlapping Rects";
DemoOverlappingRects.demoDescription = "Fast greedy algorithm to lay out a set of rects by minimizing the overlapping area" ;
DemoOverlappingRects.theme = "light-theme";