/**
 * DEMO
 */


function DemoLineSet2 (containerSvg) {


    var eventDispatch = d3.dispatch(
        "pathwaysSelectionChanged"
    );


    var self = this;

    var _parser;

    var _running = false;
    var _loopInterval;

    var svg = containerSvg;
    var _forceLayout;
    var _componentColoredCircles;
    var _svgComplexStructure;
    var _elementComplex, _elementProtein, _allElements;
    var _componentsPath, _componentPathLineFunction,_componentLabels, _componentLineLabels;
    var _allLinks;


    var d3line = d3.svg.line();

    this.start = function() {
        //drawLoop();
    };

    this.stop = function() {

        _forceLayout.stop();
        
    };


    //### helpers

    var bringToFront = function (element) {
        //bring to front
        element.each(function(){this.parentNode.appendChild(this)});
        return element;
    };

    var getSelectedPathways = function(p){return p.pathways.filter(function(pw){return pw._selected})};
    var isComponentSelected = function(p){return getSelectedPathways(p).length > 0};
    var complexRadius = function(c){return isComponentSelected(c)? 10 + Math.min(3,c.allProteins.length) : 5};
    var proteinRadius = function(p){
        return isComponentSelected(p)? 7 : 4;
    };
    var componentRadius = function(c){
      if(c.type == "complex"){
          return complexRadius(c);
      }  else {
          return proteinRadius(c);
      }
    };
    var belongsToHoveredPath = function(component){return component.pathways.filter(function(p){return p._hovered}).length > 0;}

    var chargeFunction = function(component){
        if(component._expanded){
            return -ComplexPackUtils.radiusFromComponent(component) * 100;
        } else {
            return -500;
        }
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


    var getFillForComponent = function(d){
        //first pw selected
        var firstPathwaysSelected = getSelectedPathways(d)[0];
        if(firstPathwaysSelected){
            return Colors.pathways[_parser.pathways.indexOf(firstPathwaysSelected)]
        } else return d.type == "complex" ? Colors.deselected.complex : Colors.deselected.protein;
    };


    var coloredCircleRadius = function(pathways, component){
        //remember to skip the first one, because the node itself is colored
        if(pathways._selected){

            var selectedPathways = getSelectedPathways(component);
            var indexOfSelected = selectedPathways.indexOf(pathways);
            if(indexOfSelected == 0) {
                return 0;
            } else {
                var baseRadius = component.type == "complex" ?
                complexRadius(component) + selectedPathways.length * 2 :
                proteinRadius(component) + selectedPathways.length * 2 ;

                return selectedPathways.length > 0? baseRadius-indexOfSelected*2 : 0;
            }
        } else return 0;
    };

    //### Set up functions

    var setUp = function() {
        var width = 800,
            height = 800;
        svg.attr("viewBox","0 0 800 800");
        svg.attr("preserveAspectRatio", "xMidYMid meet");
        svg.attr({
            x:0, y:0, width:"100%", height:"100%"}
        );

        _svgComplexStructure = svg.append("svg").attr("viewBox","0 0 800 800").attr({
                x:700, y:350, width:"100%", height:"100%"}
        );

        var nodes = [];
        _parser.pathways.forEach(function(pw){
            pw.allComponents = pw.allComponents.filter(function(d){return d.type != "smallMolecule"});
           nodes = _.union(nodes, pw.allComponents);
        });

        //assign colors to pathways
        for(var i = 0; i < _parser.pathways.length; i++){
            _parser.pathways[i].color = Colors.pathways[i];
        }


        _forceLayout = d3.layout.force()
            .size([width, height]);

        createAllLinks();
        var links = [];



        // Restart the force layout.
        _forceLayout
            .nodes(nodes)
            .links(links)
            .charge(chargeFunction)
            .gravity(0.2)
            .linkDistance(35)
            .friction(0.5)
            .on("tick", tick)
            .start();

        var mainG = svg.append("g").attr("transform","translate(0,0)");
        var components = mainG.selectAll(".components").data(nodes);


        _componentPathLineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate("cardinal");

        _componentsPath = mainG.selectAll(".pathways-path").data(_allLinks);


        _componentsPath.enter().append("path")
            .classed("pathways-path", true)
            .attr("stroke-width", 0)
            .attr("stroke-linecap","round")
            .attr("opacity", 1)
            .attr("fill", "none");


        _allElements = components.enter()
            .append("g")
            .classed("component", true)
            .classed(function(d){return d.type}, true)
            .attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";});


        //colored circles
        _componentColoredCircles = _allElements.selectAll(".colored-circle").data(function(d){return d.pathways});

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

        //COMPLEX
        _elementComplex = _allElements.filter(function(d){
                return d3.select(this).datum().type == "complex"}
        );


        //PROTEIN
        _elementProtein = _allElements.filter(function(d){
                return d3.select(this).datum().type == "protein"}
        );

        _allElements
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
            .on("mouseover", mouseHoverOnComponent)
            .on("mouseout", mouseOutFromComponent);

        _elementComplex.on("click", openComplex);
        //
        //_elementComplex.each(function (d) {
        //    d3.select(this).call(ComplexPack, _svgComplexStructure);
        //});


        //second circle for double stroke
        _allElements
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

        //bring to front
        bringToFront(_svgComplexStructure);

        var sideMenu = SideMenu(_parser.pathways, eventDispatch);
        onPathSelectionChanged();
        svg.append(sideMenu);
        sideMenu.view.x = 700;
        sideMenu.view.y = 50;

        eventDispatch.on("pathwaysSelectionChanged", onPathSelectionChanged);
        highlightAllPaths();
        hideLabels();
    };


    var updatePositions = function(){

        //update node

        _allElements.attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";});

        //update line segments
        //_componentsPath.attr("d", function (d) {
        //    return d3line([[d.source.x, d.source.y],[d.target.x, d.target.y]])
        //});
        _componentsPath.attr("d", function (d) {
            var start = vec2(d.source.x, d.source.y);
            var end = vec2(d.target.x, d.target.y);
            var length = vec2(d.target.x, d.target.y).subV(start).length();
            var direction = vec2(d.target.x, d.target.y).subV(start).normalize();
            var perp = direction.perpendicular().mulS(5);
            start = start.addV(direction.mulS(componentRadius(d.source)*0.8));
            end = end.subV(direction.mulS(componentRadius(d.target)*0.8));
            var handle1 = start.addV(perp).addV(direction.mulS(length/2));
            var handle2 = start.subV(perp).addV(direction.mulS(length/2));
            return "M " + start.addV(perp).toArray() +
                   " C " + handle1.toArray() + " " + handle2.toArray() + " " + end.toArray() +
                   " C " + handle2.toArray() + " " + handle1.toArray() + " " + start.subV(perp).toArray() +
                    "z";
        });


        updateLabelLinePosition();
    };


    var updateVisiblePaths = function(){
        _componentsPath
            .attr("opacity", function(d){return d.pathway._selected? 1 : 0});


        //update element radius and first pw color
        _allElements.selectAll(".component-circle").transition().duration(100).attr({
            r: componentRadius,
            "fill" : getFillForComponent
        });

        _allElements.selectAll(".component-inner-circle").transition().duration(100).attr({
            r: function(d,i){
                return d.type == "complex" ? complexRadius(d) - 2: proteinRadius(d);
            }
        });

        //colored circles
        _componentColoredCircles
            .attr({
                r: function(pw,i){ return coloredCircleRadius(pw, d3.select(this.parentNode).datum());}
            });

    };

    var tick = function(){
        updatePositions();
    };


    var createAllLinks = function () {
        _allLinks = _parser.createComponentsConnections();


    };


    var onPathSelectionChanged = function(){

        //update links according to the new selected nodes
        var links = _allLinks.filter(function(l){return l.pathway._selected});

        var selectedPathways = _parser.pathways.filter(function(p){return p._selected});

        _forceLayout.links(links);
        _forceLayout.start();
        updateVisiblePaths();

    };


    var mouseHoverOnComponent = function(d){

        d.pathways.forEach(function(p){
            if(p._selected){
                p._hovered = true;    
            }
        });

        highlightHoveredPaths();
        showLabels();
    };


    var mouseOutFromComponent = function(d){

        d.pathways.forEach(function(p){
            if(p._selected)
                p._hovered = false;
        });


        highlightAllPaths();
        hideLabels();
    };


    var showLabels = function() {

        //POSITIONATE LABELS
        var labelsLayout = RectLayout(0.1);

        //add additional rects to the layout to avoid overlapping
        _allElements.selectAll(".component-circle").each(function (d) {
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
                    return belongsToHoveredPath(d) ? "visible" : "hidden"
                }
            });

        _componentLineLabels
            .attr({
                //hide show text of selected paths
                visibility: function (d) {
                    return belongsToHoveredPath(d) ? "visible" : "hidden"
                }
            });

        updateLabelLinePosition();

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
    };


    var openComplex = function(d) {
        //bring to front
        this.parentNode.appendChild(this);
        d._expanded = true;
        d3.select(this).call(ComplexPack, _svgComplexStructure, onCloseComplex);

        //addFromInsideComplexToExternalNodeLinks(d);

        d.fixed = true;
        _forceLayout.start();


    };

    var onCloseComplex = function(d){
        d._expanded = false;
        d.fixed = false;
        _forceLayout.start();
    };


    var highlightHoveredPaths = function() {

        _componentsPath
            .attr("fill", function(d,i){
                return d.pathway._hovered? d.pathway.color : Colors.desaturate(d.pathway.color);
            }
        );

        _allElements.selectAll(".component-circle")
            .attr("fill", function(component){
                if(belongsToHoveredPath(component)){
                    return getFillForComponent(component);

                } else return Colors.desaturate(getFillForComponent(component));
            });

        _componentColoredCircles
            .attr("r", function(pw,i) {
                var component = d3.select(this.parentNode).datum();
                if (!belongsToHoveredPath(component)){
                    return 0;
                } else{
                    return coloredCircleRadius(pw, component);
                }
            });
    };


    var highlightAllPaths = function() {
        _componentsPath
            .attr("fill", function(d){return d.pathway.color});

        _allElements.selectAll(".component-circle")
            .attr("fill", getFillForComponent);

        _componentColoredCircles
            .attr("r", function(pw,i) {
                    return coloredCircleRadius(pw, d3.select(this.parentNode).datum());
            });
    };


    var updateLabelLinePosition = function(){
        _componentLineLabels
            .attr({
                d : pathFromLabelToNode
            });
    };


    //var addFromInsideComplexToExternalNodeLinks = function(complex){
    //    complex.allComponents.forEach(function(c){
    //        console.log(c.nextComponents);
    //        if(c.nextComponents.length > 0){
    //            console.log(c);
    //        }
    //    });
    //};


    //DEMO FUNCTIONS

    var loadAssets = function(callback) {

        //var request = d3.xml("resources/demos/owl/1_RAF-Cascade.owl", "application/xml", function(d) {
        var request = d3.xml("resources/demos/owl/Rb-E2F1.owl", "application/xml", function(d) {
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
DemoLineSet2.demoTitle = "LineSet2 Demo";
DemoLineSet2.demoDescription = "Implementation of the LineSet visualization for highlight how different pathways share proteins and complexes" ;
DemoLineSet2.theme = "dark-theme";