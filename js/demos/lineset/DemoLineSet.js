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

    var svg = containerSvg;
    var _forceLayout;
    var _componentNode, _componentColoredCircles;
    var _componentsPath, _componentPathLineFunction,_componentLabels, _componentLineLabels;


    var _pathwaysPath;

    this.start = function() {
        //drawLoop();
    };

    this.stop = function() {
        //if(_running){
        //    _running = false;
        //    clearInterval(_loopInterval);
        //}

        _forceLayout.stop();
        
    };


    //### helpers

    var getSelectedPathways = function(p){return p.pathways.filter(function(pw){return pw._selected})};
    var isComponentSelected = function(p){return getSelectedPathways(p).length > 0};
    var complexRadius = function(c){return isComponentSelected(c)? 10 + c.allProteins.length*2 : 5};
    var proteinRadius = function(p){
        return isComponentSelected(p)? 7 : 4;
    };

    var pathFromLabelToNode = function(d){

        var point1 = [d._labelRect.x + d._labelRect.width, d._labelRect.y + d._labelRect.height - 3],
            point2 = [d._labelRect.x, d._labelRect.y + d._labelRect.height - 3];

        if(Math.abs(d._labelRect.x - d.x) < Math.abs(d._labelRect.x + d._labelRect.width - d.x) ){
            return d3.svg.line()([point1, point2, [d.x, d.y ]]);
        } else {
            return d3.svg.line()([point2, point1, [d.x, d.y ]]);
        }

    };


    //### Set up functions

    var setUp = function() {
        var width = 500,
            height = 500;
        svg.attr("viewBox","0 0 600 600");
        svg.attr("preserveAspectRatio", "xMidYMid meet");
        svg.attr({
            x:0, y:0, width:"100%", height:"100%"}
        );

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
            .charge(-600)
            .linkDistance(15)
            .friction(0.5)
            .on("tick", tick)
            .start();


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
            .attr("stroke-linecap","round")
            .attr("opacity", 1)
            .attr("fill", "none");

        _componentNode = components.enter()
            .append("g")
            .classed("component", true)
            .classed(function(d){return d.type}, true)
            .attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";});



        //colored circles
        _componentColoredCircles =_componentNode.selectAll(".colored-circle").data(function(d){return d.pathways});

        _componentColoredCircles
            .enter()
            .append("circle")
            .classed("colored-circle",true)
            .attr({
                r:0,
                "fill" : function(d,i){
                    return Colors.pathways[_parser.pathways.indexOf(d)]
                },
                "stroke-width" : 0,
                "stroke" : "black"
            });

        //normal circle
        _componentNode
            .append("circle")
            .classed("component-circle",true)
            .attr({
                r: function(d,i){
                    return d.type == "complex" ? complexRadius(d) : proteinRadius(d);
                },
                "fill" : function(d){return d.type == "complex" ? Colors.deselected.complex : Colors.deselected.protein },
                "stroke-width" : 1,
                "stroke" : "black"
            })
            .attr("pointer-events", "all")
            .on("mouseover", showLabels)
            .on("mouseout", hideLabels);

        //second circle for double stroke
        _componentNode
            .append("circle")
            .classed("component-inner-circle",true)
            .attr({
                r: function(d,i){
                    return d.type == "complex" ? complexRadius(d) - 2 : 0;
                },
                "fill" : "none",
                "stroke-width" : 1,
                "stroke" : "black"
            });


        //names
        _componentLabels = components.enter()
            .append("text")
            .classed("component-label", true)
            .attr({
                "text-anchor": "middle",
                fill: "white",
                "font-size" : 7
            })
            .text(function(d){return d.name;})
            .each(function(d){
                var bbox = d3.select(this)[0][0].getBBox();
                d._labelRect = rect2d(d.x,d.y,bbox.width + 5,bbox.height + 5)
            });

        _componentLineLabels = components.enter()
            .append("path")
            .classed("component-line-label",true)
            .attr({
                fill: "none",
                "stroke-width" : 1,
                opacity : 0.4,
                stroke : "white"
            });

        var sideMenu = SideMenu(_parser.pathways);
        onPathSelectionChanged();
        svg.append(sideMenu);
        sideMenu.view.x = 500;
        sideMenu.view.y = 50;

        eventDispatch.on("pathwaysSelectionChanged", onPathSelectionChanged)
        hideLabels();
    };

    var update = function(){

        _componentsPath
            .attr("d", function(d){return _componentPathLineFunction(_pathwaysPath.computePositions(d))})
            .attr("opacity", function(d){return d._selected? 1 : 0});


        //update element radius and first pw color
        _componentNode.select(".component-circle").transition().duration(100).attr({
            r: function(d,i){
                return d.type == "complex" ? complexRadius(d) : proteinRadius(d);
            },
            "fill" : function(d,i){
                //first pw selected
                var firstPathwaysSelected = getSelectedPathways(d)[0];
                if(firstPathwaysSelected){
                    return Colors.pathways[_parser.pathways.indexOf(firstPathwaysSelected)]
                } else return d.type == "complex" ? Colors.deselected.complex : Colors.deselected.protein;
            }
        });

        _componentNode.select(".component-inner-circle").transition().duration(100).attr({
            r: function(d,i){
                return d.type == "complex" ? complexRadius(d) - 2: proteinRadius(d);
            }
        });

        //colored circles
        _componentColoredCircles
            .attr({
                r: function(pw,i){
                    //remember to skip the first one, because the node itself is colored
                    if(pw._selected){

                        var component = d3.select(this.parentNode).datum();
                        var selectedPathways = getSelectedPathways(component);
                        var indexOfSelected = selectedPathways.indexOf(pw);
                        if(indexOfSelected == 0) {
                            return 0;
                        } else {
                            var baseRadius = component.type == "complex" ?
                            complexRadius(component) + selectedPathways.length*2 :
                            proteinRadius(component) + selectedPathways.length*2 ;

                            return selectedPathways.length > 0? baseRadius-indexOfSelected*2 : 0;
                        }
                    } else return 0;
                }
            });

        updateLabelLinePosition();
    };

    var tick = function(){

        _componentNode.attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";})

        update();

    };


    var onPathSelectionChanged = function(){

        //update links according to the new selected nodes
        var links = [];

        _parser.pathways.filter(function(p){return p._selected}).forEach(function(pathway){
            links = links.concat(d3.range(pathway.allComponents.length - 1)
                .map(function(i){return {source: pathway.allComponents[i], target: pathway.allComponents[i+1]}}));

        });

        _forceLayout.links(links);
        _forceLayout.start();


    };


    var showLabels = function() {

        //POSITIONATE LABELS
        var labelsLayout = RectLayout(0.1);

        //add additional rects to the layout to avoid overlapping
        _componentNode.select(".component-circle").each(function (d) {
            var bbox = d3.select(this)[0][0].getBBox();
            var rect = rect2d(d.x - bbox.width, d.y - bbox.height, bbox.width * 2, bbox.height * 2);
            labelsLayout.addFixedRectangle(rect);
        });

        _componentLabels.each(function (d) {
            if (isComponentSelected(d)) {
                d._labelRect.x = d.x;
                d._labelRect.y = d.y;
                labelsLayout.addRectangle(d._labelRect);
            }
        });

        _componentLabels
            .attr({
                x: function (d) {
                    return d._labelRect.center().x
                },
                y: function (d) {
                    return d._labelRect.y + d._labelRect.height / 2
                },
                //hide show text of selected paths
                visibility: function (d) {
                    return isComponentSelected(d) ? "visible" : "hidden"
                }
            });

        _componentLineLabels
            .attr({
                //hide show text of selected paths
                visibility: function (d) {
                    return isComponentSelected(d) ? "visible" : "hidden"
                }
            });

        updateLabelLinePosition();


        //svg.selectAll("rect").data(labelsLayout.rects).enter().append("rect")
        //    .attr({
        //        x: function (d) {
        //            return d.x
        //        },
        //        y: function (d) {
        //            return d.y
        //        },
        //        width: function (d) {
        //            return d.width
        //        },
        //        height: function (d) {
        //            return d.height
        //        },
        //        fill: "none",
        //        "stroke": "white",
        //        "stroke-width": 2
        //    });
    };

    var hideLabels = function() {
        _componentLabels
            .attr({
                visibility: "hidden"
            });

        _componentLineLabels
            .attr({
                visibility: "hidden"
            });


        //svg.selectAll("rect").remove();
    };

    var updateLabelLinePosition = function(){
        _componentLineLabels
            .attr({
                d : pathFromLabelToNode
            });
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
DemoLineSet.demoDescription = "Implementation of the LineSet visualization for highlight how different pathways share proteins and complexes" ;
DemoLineSet.theme = "dark-theme";