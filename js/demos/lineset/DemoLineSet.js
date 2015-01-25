/**
 * DEMO
 */

var eventDispatch = d3.dispatch(
    "pathwaysSelectionChanged"
);

function DemoLineSet (containerSvg) {
    var self = this;

    var _parser;

    var _running = false;
    var _loopInterval;

    var svg = UISvgView(containerSvg);
    var _forceLayout;
    var _componentNode;
    var _componentsPath, _componentPathLineFunction;


    var _pathwaysPath;

    this.start = function() {
        drawLoop();
    };

    this.stop = function() {
        if(_running){
            _running = false;
            clearInterval(_loopInterval);
        }
    };


    //### helpers




    //### Set up functions

    var setUp = function() {
        var width = 500,
            height = 500;
        svg.attr("viewBox","0 0 600 600");
        svg.setAspectRatioOptions("xMidYMid meet");
        svg.setFrame(0,0,"100%","100%");

        var nodes = [];
        _parser.pathways.forEach(function(pw){
            pw.allComponents = pw.allComponents.filter(function(d){return d.type != "smallMolecule"});
           nodes = _.union(nodes, pw.allComponents);
        });


        _pathwaysPath = PathwaysPath(_parser.pathways);

        _forceLayout = d3.layout.force()
            .size([width, height]);

        var links = [];

        // Restart the force layout.
        _forceLayout
            .nodes(nodes)
            .links(links)
            .charge(-350)
            .linkDistance(15)
            .on("tick", tick)
            .start();

        var complexRadius = function(c){return 10 + c.allProteins.length*2};

        var mainG = svg.append("g").attr("transform","translate(0,0)");
        var components = mainG.selectAll(".components").data(nodes);


        _componentPathLineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate("cardinal");


        _componentsPath = mainG.selectAll(".pathways-path").data(_parser.pathways);

        _componentsPath.enter().append("path")
            .classed("pathways-path", true)
            .attr("stroke", function(d,i){return Colors.pathways[i]})
            .attr("stroke-width", 7)
            .attr("opacity", 1)
            .attr("fill", "none");

        _componentNode = components.enter()
            .append("g")
            .classed("component", true)
            .classed(function(d){return d.type}, true)
            .attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";})
            .on("mouseover", null)
            .on("mouseout", null);

        _componentNode
            .append("circle")
            .attr({
                r: function(d,i){
                    return d.type == "complex" ? complexRadius(d) : 10;
                },
                "fill" : function(d){return d.type == "complex" ? "#fec44f" : "#43a2ca" },
                "stroke-width" : 1,
                "stroke" : "black"
            });

            //second circle for double stroke
        _componentNode
            .append("circle")
            .attr({

                r: function(d,i){
                    return d.type == "complex" ? complexRadius(d) - 2 : 0;
                },
                "fill" : "none",
                "stroke-width" : 1,
                "stroke" : "black"
            });

        _componentNode
            .append("text")
            .classed("component-name", true)
            .attr({
                x: 0,
                y : 2,
                "text-anchor": "middle",
                fill: "white",
                "font-size" : 7
            })
            .text(function(d){return d.name;});

        var sideMenu = SideMenu(_parser.pathways);
        onPathSelectionChanged();
        svg.append(sideMenu);
        sideMenu.view.x = 500;
        sideMenu.view.y = 50;

        eventDispatch.on("pathwaysSelectionChanged", onPathSelectionChanged);
    };

    var update = function(){
        _componentsPath
            .attr("d", function(d){return _componentPathLineFunction(_pathwaysPath.computePositions(d))})
            .attr("opacity", function(d){return d._selected? 0.8 : 0});
    };

    var tick = function(){

        _componentNode.attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";})

        update();

    };


    var onPathSelectionChanged = function(){
        console.log("changed");
        var links = [];

        _parser.pathways.filter(function(p){return p._selected}).forEach(function(pathway){
            links = links.concat(d3.range(pathway.allComponents.length - 1)
                .map(function(i){return {source: pathway.allComponents[i], target: pathway.allComponents[i+1]}}));

        });

        _forceLayout.links(links);
        _forceLayout.start();
    };



    var loadAssets = function(callback) {

        var request = d3.xml("resources/demos/owl/1_RAF-Cascade.owl", "application/xml", function(d) {
            _parser = BiopaxParser(d3.select(d));
            window.parser = _parser;//
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
DemoLineSet.demoTitle = "LineSet Demo";
DemoLineSet.demoDescription = "Description" ;
DemoLineSet.theme = "dark-theme";