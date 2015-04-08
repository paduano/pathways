function PathwaysGraph() {
    var self = UISvgView();

    //Parameters
    var _width = 500, _height = 500;

    //filters
    var _nameFilters = [];

    //D3 Tools

    var _componentsForceLayout;

    //Behaviours
    //var dragBehaviour = d3.behavior.drag()
    //    .origin(function(d) { return d; })
    //    .on("dragstart", dragstarted)
    //    .on("drag", dragged)
    //    .on("dragend", dragended),
        var _zoomBehaviour = d3.behavior.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", zoomed),
        _componentDragBehaviour;

    //states
    var _isDraggingComponent = false;

    //D3 elements
    var _gVisualization,
        _gComponents,
        _gReactions,
        _gOverlayLayer,
        _svgComplexStructure,
        _allComponentElements,
        _allLinkElements,
        _complexElements,
        _proteinElements,
        //labels
        _gLabels,
        _searchPathLine;


    //Components

    var _visibleComponents,
        _allComponents,
        _expansionMarkers,
        _proteins,
        _complexes,
        _reactions,
        _visibleReactions,
        _pathways;

    var _selectedComponents = [],
        _forceLayoutLinks;


    //STATE
    var _startComponent, _endComponent, _pathDragging = false;

    //## PRIVATE FUNCTIONS


    //D3 helpers functions

    var componentKey = function(c){return c.name};
    var reactionKey = function(c){return c.source.name + c.target.name + c.pathways.length}; //XXX wrong
    var getSelectedPathways = function(p){return p.pathways.filter(function(pw){return pw._selected})};
    var getHighlightedPathways = function(p){return p.pathways.filter(function(pw){return pw._highlighted && pw._selected})};
    var isComponentHighlighted = function(p){return getHighlightedPathways(p).length > 0};
    var proteinRadius = PathwaysGraphDrawingUtils.proteinRadius;
    var complexSize = PathwaysGraphDrawingUtils.complexSize;
    var hasUpstream = function(c){return c.previousComponents.filter(function (el) {return !el._visible}).length > 0};
    var hasDownstream = function(c){return c.nextComponents.filter(function (el) { return  !el._visible}).length > 0};

    var forceLayoutChargeFunction = function(component){
        if(component._expanded){
            return -ComplexPackUtils.radiusFromComponent(component) * 100;
        } else {
            return -2800;//XXX 800
        }
    };

    var getFillForComponent = function(d){
        //first pw selected
        var firstPathwaysSelected = getSelectedPathways(d)[0];
        if(firstPathwaysSelected){
            return firstPathwaysSelected.color;
        } else "black"//return d.type == "complex" ? Colors.deselected.complex : Colors.deselected.protein;;
    };

    var coloredCircleRadius = function(pathways, component){
        //remember to skip the first one, because the node itself is colored
        if(pathways._selected){
            var selectedPathways = getSelectedPathways(component);
            var indexOfSelected = selectedPathways.indexOf(pathways);
            if(indexOfSelected == 0) {
                return 0;
            } else {
                if(component.type == "complex"){
                    var baseRadius = complexSize(component) + selectedPathways.length * 4;
                    return selectedPathways.length > 0 ? baseRadius - indexOfSelected*4 : 0;
                } else {
                    var baseRadius = proteinRadius(component) + selectedPathways.length * 2 ;
                    return selectedPathways.length > 0 ? baseRadius - indexOfSelected*2 : 0;
                }

            }
        } else return 0;
    };

    //init helpers

    var initElements = function(){

        self.call(_zoomBehaviour).on("dblclick.zoom", null);
        _gVisualization = self.append("g");

        //dummy rect
        var rect = _gVisualization.append("rect")
            .attr("x", -_width*100)
            .attr("y", -_height*100)
            .attr("width", _width*200)
            .attr("height", _height*200)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mousedown", mouseDownOnBackground);

        _gComponents = _gVisualization.append("g");
        _gReactions = _gVisualization.append("g");
        _gLabels = _gVisualization.append("g");
        _gOverlayLayer = _gVisualization.append("g");
        _svgComplexStructure = self.append("svg")
            .classed("complex-structure", true)
            .attr("viewBox","0 0 800 800").attr({
                x:100, y:0, width:"100%", height:"100%"}
        );


    };


    var initForceLayout = function() {
        _componentsForceLayout =
            d3.layout.force()
            .size([_width, _height])
            .charge(forceLayoutChargeFunction)
            .gravity(0.4)
            .linkDistance(45)
            .friction(0.5)
            .on("tick", forceLayoutTick)

    };

    var initActions = function () {
        _componentDragBehaviour = d3.behavior.drag()
            .on("dragstart", onDragStartOnComponent)
            .on("drag", onDragMoveOnComponent)
            .on("dragend", onDragEndOnComponent);

        d3.select(window)
            .on("mousemove", onMouseMove);

    };


    var updateForceLayoutNodesAndLinks = function(){
        _componentsForceLayout
            .nodes(_visibleComponents)
            .links(_forceLayoutLinks);
            //.start();
    };


    var updateComplexesAndProteinsElements = function(){
        var components = _gComponents.selectAll(".pathway-component").data(_visibleComponents, componentKey);

        var newElements = components.enter()
            .append("g")
            .classed("pathway-component", true)
            //.classed(function(d){return "pathway-" + d.type}, true)
            .attr("cursor", "pointer")
            .on("click", onClickOnComponent)
            .on("mouseover", onMouseEnterOnComponent)
            .on("mouseout", onMouseOutOnComponent)
            .on("mousedown", onMouseDownOnComponent)
            .on("mouseup", onMouseUpOnComponent)
            .call(_componentDragBehaviour);

        var enterComplexElements = newElements.filter(function(d){return d3.select(this).datum().type == "complex"});


        var enterProteinElements = newElements.filter(function(d){return d3.select(this).datum().type == "protein"});

        //colored circles
        var coloredCircleElement = enterProteinElements.selectAll(".protein-colored-circle").data(function(d){return d.pathways});

        coloredCircleElement.enter()
            .append("circle")
            .attr("pointer-events", "none")
            .classed("protein-colored-circle",true)
            .attr({
                r:0,
                fill : function(pathway){return pathway.color},
                "stroke-width" : 0,
                "stroke" : "black"
            });

        //colored rectangles
        var coloredRectangleElement = enterComplexElements.selectAll(".complex-colored-rectangle").data(function(d){return d.pathways});
        coloredRectangleElement.enter()
            .append("rect")
            .attr("pointer-events", "none")
            .classed("complex-colored-rectangle",true)
            .attr({
                rx : 3,
                ry : 3,
                fill : function(pathway){return pathway.color}
            });


        enterProteinElements.append("circle")
            .classed("protein-circle",true)
            .attr({
                r: proteinRadius,
                "stroke-width" : 1
            })
            .attr("pointer-events", "all");


        enterComplexElements.append("rect")
            .each(function (d) {d._width = complexSize(d)})
            .classed("complex-rect",true)
            .attr({
                x: function(d){return -d._width/2},
                y: function(d){return -d._width/2},
                width: function(d){return d._width},
                height: function(d){return d._width},
                rx : 3,
                ry : 3
            })
            .attr("pointer-events", "visiblePainted");

        //Remove
        components.exit().remove();


        //Update

        _allComponentElements = _gComponents.selectAll(".pathway-component");

        _complexElements = _allComponentElements.filter(function(d){
                return d3.select(this).datum().type == "complex"}
        );

        _proteinElements = _allComponentElements.filter(function(d){
                return d3.select(this).datum().type == "protein"}
        );


        //update colors
        _complexElements.selectAll(".complex-rect").attr("fill", getFillForComponent);
        _proteinElements.selectAll(".protein-circle").attr("fill", getFillForComponent);

        //colored circles sizes
        _proteinElements.selectAll(".protein-colored-circle")
            .attr({
                r: function(pw,i){ return coloredCircleRadius(pw, d3.select(this.parentNode).datum());}
            });

        _complexElements.selectAll(".complex-colored-rectangle")
            .each(function (pw) {this._width = coloredCircleRadius(pw, d3.select(this.parentNode).datum())})
            .attr({
                x: function(d){return -this._width/2},
                y: function(d){return -this._width/2},
                width: function(d){return this._width},
                height: function(d){return this._width}
            });

        //add upstream and downstream markers
        //var allNewElements =

        var newExpansionMarkers = d3.selectAll(enterComplexElements[0].concat(enterProteinElements[0])).append('g')
            .classed("expansion-marker",true);

        newExpansionMarkers.append('polygon')
            .classed("expansion-marker-downstream", true)
            .attr('points', '-3.5 0.5, 3.5 0.5 ,0 5');

        newExpansionMarkers.append('polygon')
            .classed("expansion-marker-upstream", true)
            .attr('points', '-3.5 -0.5, 3.5 -0.5 ,0 -5');


        _expansionMarkers = d3.selectAll('.expansion-marker');

        _expansionMarkers.selectAll(".expansion-marker-downstream")
            .attr('opacity', function(d){return hasDownstream(d) ? 0.5 : 0});

        _expansionMarkers.selectAll(".expansion-marker-upstream")
            .attr('opacity', function(d){return hasUpstream(d) ? 0.5 : 0});


        enableDragging();
    };


    var updateReactionsElements = function() {


        var links = _gReactions.selectAll(".pathway-link").data(_forceLayoutLinks,reactionKey );

        var newLinks = links.enter()
            .append("g")
            .each(function (d) {
                d._justVisible = true;
            })
            .classed("pathway-link", true);


        newLinks.selectAll(".pathway-link-polygon").data(function(link){return link.pathways}).enter()
            .append("polygon")
            .classed("pathway-link-polygon", true)
            .attr({
                fill: function(pw){return pw.color}
            });

        links.exit().remove();

        _allLinkElements = _gReactions.selectAll(".pathway-link");

    };


    var updateLabels = function() {
        //UPDATE LABELS
        var components = _gLabels.selectAll(".component-label").data(_visibleComponents, componentKey);
        var newElements = components.enter()
            .append("g")
            .classed("component-label", true)
            .attr("pointer-events","none");
        //names
        newElements
            .append("text")
            .classed("component-label-text", true)
            .attr({
                "text-anchor": "middle",
                fill: "black",
                "font-size" : 7
            })
            .text(function(d){return d.name;})
            .each(function(d){
                var bbox = d3.select(this)[0][0].getBBox();
                d._labelRect = rect2d(d.x,d.y,bbox.width + 5,bbox.height + 5)
            });

        //lines
        newElements
            .append("path")
            .classed("component-line-label",true)
            .attr({
                fill: "none",
                "stroke-width" : 1,
                opacity : 0.4,
                stroke : "black"

            });
        components.exit().remove();

        _gLabels.attr('visibility','hidden');

    };

    //Timing
    var forceLayoutTick = function(e) {
        if(e)updateLayoutForces(e.alpha);
    };

    var updateLayout = function() {
        for(var i = 0; i<150; i++){
            _componentsForceLayout.start();
            _componentsForceLayout.tick();
            _componentsForceLayout.stop();
        }
        updateElementsPositionWithAnimation();
    };


    var updateElementsPositionWithAnimation = function () {
        var TRANSITION_DURATION = 500;

        _allComponentElements.filter(function (d) {return d._justVisible})
            .attr('opacity', 0)
            .attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";})
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";})
            .attr('opacity', 1);

        _allComponentElements.filter(function (d) {return !d._justVisible})
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('opacity', 1)
            .attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";});

        _allLinkElements.selectAll(".pathway-link-polygon").filter(function () {return d3.select(this.parentNode).datum()._justVisible})
            .attr({points: function(){
                var source = d3.select(this.parentNode).datum().source;
                var points = ' ' + [source.x,source.y];
                for(var i = 0; i < 5; i++)points += ', ' + [source.x,source.y];
                return points;
            }})
            .transition()
            .duration(TRANSITION_DURATION)
            .attr({points: function(pw){ return PathwaysGraphDrawingUtils.link(d3.select(this.parentNode).datum(),pw)}});


        _allLinkElements.selectAll(".pathway-link-polygon").filter(function (d) {return !d._justVisible})
            .transition()
            .duration(TRANSITION_DURATION)
            .attr({points: function(pw){ return PathwaysGraphDrawingUtils.link(d3.select(this.parentNode).datum(),pw)}});


        _visibleComponents.concat(_visibleReactions).forEach(function (c) {
            c._justVisible = false;
        });

    };

    var updateElementsPosition = function () {

        _allComponentElements
            .attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";});

        _allLinkElements.selectAll(".pathway-link-polygon")
            .attr({points: function(pw){ return PathwaysGraphDrawingUtils.link(d3.select(this.parentNode).datum(),pw)}});

    };


    var updateLayoutForces = function (alpha) {
        if(alpha && _allLinkElements){
            var k = alpha * 30;
            _allLinkElements.each(function (link) {
                link.source.y -= k;
                link.target.y += k;
            });
        }
    };

    //Graphics Elements

    //Labelling
    var showLabels = function() {

        //POSITIONATE LABELS
        var labelsLayout = RectLayout(0.1);

        //add additional rects to the layout to avoid overlapping
        _allComponentElements.selectAll(".protein-circle,.complex-rect").each(function (d) {
            var bbox = d3.select(this)[0][0].getBBox();
            var rect = rect2d(d.x - bbox.width, d.y - bbox.height, bbox.width * 2, bbox.height * 2);
            labelsLayout.addFixedRectangle(rect);
        });

        _gLabels.selectAll(".component-label-text").each(function (d) {
            if (isComponentHighlighted(d)) {
                d._labelRect.x = d.x;
                d._labelRect.y = d.y;
                labelsLayout.addRectangle(d._labelRect);
            }
        });

        _gLabels.selectAll(".component-label-text")
            .attr({
                x: function (d) {
                    return d._labelRect.center().x
                },
                y: function (d) {
                    return d._labelRect.y + d._labelRect.height / 2
                },
                //hide show text of selected paths
                visibility: function (d) {
                    return isComponentHighlighted(d) ? "visible" : "hidden"
                }
            });

        _gLabels.selectAll(".component-line-label")
            .attr({
                //hide show text of selected paths
                visibility: function (d) {
                    return isComponentHighlighted(d) ? "visible" : "hidden"
                }
            });

        _gLabels.selectAll(".component-line-label")
            .attr({
                d : PathwaysGraphDrawingUtils.pathFromLabelToNode
            });


        //labelsLayout.rects.forEach(function (rect) {
        //
        //
        //    _gLabels.append("rect")
        //        .attr({
        //            x:rect.x,
        //            y:rect.y,
        //            width:rect.width,
        //            height:rect.height,
        //            fill:"none",
        //            "stroke": "black",
        //            "stroke-width": 2
        //        })
        //});


    };


    var hideLabels = function() {
        _gLabels.selectAll(".component-label-text")
            .attr({
                visibility: "hidden"
            });

        _gLabels.selectAll(".component-line-label")
            .attr({
                visibility: "hidden"
            });
    };


    var highlightPathways = function () {
        _gComponents.selectAll(".complex-rect")
            .attr("fill", function(d,i){
                return isComponentHighlighted(d)? getFillForComponent(d) : Colors.desaturate(getFillForComponent(d));
            }
        );

        _gComponents.selectAll(".protein-circle")
            .attr("fill", function(d,i){
                return isComponentHighlighted(d)? getFillForComponent(d) : Colors.desaturate(getFillForComponent(d));
            }
        );

        _gComponents.selectAll(".complex-colored-rectangle")
            .attr("fill", function(pw,i){
                return pw._highlighted? pw.color : Colors.desaturate(pw.color);
            }
        );

        _gComponents.selectAll(".protein-colored-circle")
            .attr("fill", function(pw,i){
                return pw._highlighted? pw.color : Colors.desaturate(pw.color);
            }
        );

        _gReactions.selectAll(".pathway-link-polygon")
            .attr("fill", function(pw,i){
                return pw._highlighted? pw.color : Colors.desaturate(pw.color);
            }
        );

    };


    //Interactions

    var clickedOnce = false, onDragging = false;
    var clickTimer;

    var onMouseDownOnComponent = function (component) {

    };

    var onMouseUpOnComponent = function (component) {


    };

    var mouseDownOnBackground = function () {
        if(_pathDragging){
            onEndPathExpansion();
        }

    };

    var onMouseMove = function (component) {
        if(_pathDragging){
            var coordinates = d3.mouse(_gReactions.node());
            var x = coordinates[0];
            var y = coordinates[1];
            _searchPathLine
                .attr("d", d3.svg.line()([[_startComponent.x, _startComponent.y],[x,y]]));
        }
    };

    var onClickOnComponent = function (component) {
        var event = d3.event;
        if (clickedOnce) {
            onDoubleClickOnComponent.apply(this, [component]);
            clickedOnce = false;
        } else {
            clickTimer = setTimeout(function() {
                if(!onDragging && clickedOnce)
                    onSingleClickOnComponent.apply(this, [event,component]);
                clickedOnce = false;
            }, 200);
            clickedOnce = true;
        }
    };

    var onSingleClickOnComponent = function(event, component){

        if(_pathDragging){
            onEndPathExpansion(component);
        } else if(event.shiftKey){
            if(!_pathDragging){
                onStartPathExpansion(component);
            }
        } else {
            expandDownstream(component);
            expandUpstream(component);
            self.updateContext();
        }

    };

    var onDoubleClickOnComponent = function (component) {

        if(component.type == "complex")
            openComplex(this, component);
    };

    var onMouseEnterOnComponent = function (component) {
        _pathways.forEach(function (pw) {
            if(_.contains(component.pathways, pw))
                pw._highlighted = true;
            else
                pw._highlighted = false;
        });
        //component.pathways.forEach(function (pw) {pw._highlighted = true});
        if(!xxx_keepLabelsHidden)
            showLabels();
        highlightPathways();

        _componentsForceLayout.stop();
    };

    var onMouseOutOnComponent = function (component) {
        _pathways.forEach(function (pw) {pw._highlighted = true});
        //component.pathways.forEach(function (pw) {pw._highlighted = false});
        hideLabels();
        highlightPathways();


    };

    var onDragStartOnComponent = function(d, i) {
        //_componentsForceLayout.stop(); // stops the force auto positioning before you start dragging
        d.fixed = true;

        disablePanningAndZooming();
    };

    var onDragMoveOnComponent = function (d, i) {
        onDragging = true;
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        forceLayoutTick();
        updateElementsPosition();
    };

    var onDragEndOnComponent = function (d, i) {
        setTimeout(function() {
            onDragging = false;
        }, 500);

        //Resume PANNING AND ZOOM
        enablePanningAndZooming();
    };

    var enableDragging = function () {
        _allComponentElements.call(_componentDragBehaviour);

    };

    var disableDragging = function () {
        d3.selectAll(".pathway-component").on('mousedown.drag', null);
    };

    var disablePanningAndZooming = function () {
        self.on("mousedown.zoom", null);
    };

    var enablePanningAndZooming = function () {
        self.call(_zoomBehaviour).on("dblclick.zoom", null);
    };




    function zoomed() {
        _gVisualization.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    var xxx_keepLabelsHidden = false;
    var openComplex = function(element, d) {
        //bring to front
        element.parentNode.appendChild(element);

        //XXX
        _gComponents.node().parentNode.appendChild(_gComponents.node());
//        xxx_keepLabelsHidden = true;

        d._expanded = true;
        d3.select(element).call(ComplexPack,
            _svgComplexStructure,
            onCloseComplex,
            {useRect : true, coloringMode : "flat", color : getFillForComponent(d)});

        //d.fixed = true; XXX
        //_componentsForceLayout.start();
    };

    var onCloseComplex = function(d){
        d._expanded = false;
        d.fixed = false;
        //_componentsForceLayout.start();
    };


    var expandDownstream = function (component) {
        component.nextComponents.forEach(function (nextComponent) {
            setComponentVisibility(nextComponent, true);
            nextComponent._explored = true;
        });

    };


    var expandUpstream = function (component) {
        component.previousComponents.forEach(function (previousComponent) {
            setComponentVisibility(previousComponent, true);
            previousComponent._explored = true;
        });
    };


    var onStartPathExpansion = function (component) {


        _pathDragging = true;
        _startComponent = component;
        //XXX
        //disableDragging();
        //disablePanningAndZooming();
        var xxx_keepLabelsHidden = false;
        hideLabels();

        _searchPathLine = _gReactions.append("path")
            .style("stroke-dasharray", ("3, 3"))
            .classed("search-line", true)
            .attr("stroke","gray")
            .attr("stroke-width", 3)
            .attr("d", d3.svg.line()([[_startComponent.x, _startComponent.y],
                [_startComponent.x, _startComponent.y]]));

        //highlightDownstream/upstream
        var results = PathwaysSearchUtils.searchPath(component);
        var upstream = results[1],
            downstream = results[0];

        var downStreamElements = _allComponentElements.filter(function (d) { return downstream.indexOf(d) > -1 });
        var upStreamElements = _allComponentElements.filter(function (d) { return upstream.indexOf(d) > -1 });
        downStreamElements.append('polygon')
            .classed('path-marker', true)
            .attr('points', "-20 -1, 20 -1, 0 15")
            .attr('opacity',0.5);

        //upStreamElements.append('polygon')
        //    .classed('path-marker', true)
        //    .attr('points', "-20 1, 20 1, 0 -15")
        //    .attr('opacity',0.5);


    };

    var onEndPathExpansion = function (component) {
        if(component){
            _endComponent = component;
            expandPath(_startComponent, _endComponent);
        }

        _pathDragging = false;
        _searchPathLine.remove();
        d3.selectAll('.path-marker').remove();
    };


    var expandPath = function (start, end, previous) {
        if(!previous)
            previous = [];
        //XXX stupid and dummy search
        var elements = previous;
        var next = start;
        while(next.nextComponents.length > 0 ){
            var exit = false;
            if(next.nextComponents.length == 1){
                next = next.nextComponents[0];
                elements.push(next);
            } else {
                next.nextComponents.forEach(function (e) {

                    if(e == end){
                        elements.push(e);
                        elements.forEach(function (element) {
                            setComponentVisibility(element, true);
                        });
                        self.updateContext();
                        exit = true
                    }  else if(previous.length < 5) {
                       expandPath(e, end, elements.concat(e));
                   }
                   exit = true;
                });
            }

            if(exit)
                break;


            if(next == end){
                elements.forEach(function (element) {
                    setComponentVisibility(element, true);
                });
                self.updateContext();
                break;
            }
        }

    };

    var setComponentVisibility = function(component, visibility){
        if(visibility && !component._visible){
            component._justVisible = true;
        }

        component._visible = visibility;

    };

    //Processing

    var createLinks = function() {
        var links = [];

        function findSameLink(source, target){
            for(var i = 0; i < links.length; i++){
                var l = links[i];
                if(l.source == source && l.target == target) {
                    return l;
                }
            }
            return null;
        }

        function selectedPathways(reaction){
            return reaction.pathways.filter(function (pw) {
                return pw._selected
            })
        }


        _visibleComponents.forEach(function (component) {

            _visibleReactions.forEach(function (reaction) {
                if(reaction.left.indexOf(component) > -1){
                    var rights = reaction.right.filter(function(d){return d.type == "complex" || d.type == "protein" });
                    rights.forEach(function (right) {
                        if(_visibleComponents.indexOf(right) > -1) { //XXX NOT EFFICIENT. STORE in COMPONENT
                            //search if there is already a link
                            var existingLink = findSameLink(component,right);
                            if(existingLink){
                                console.error("this should not happen");
                                //existingLink.pathways.push(pathway)
                            } else {
                                var oppositeLink = findSameLink(right, component);
                                if(oppositeLink) {
                                    links.push({
                                        source: component, target: right,
                                        pathways: _.difference(selectedPathways(reaction),oppositeLink.pathways)
                                    });
                                    links.push({
                                        source: right, target: component,
                                        pathways: _.difference(oppositeLink.pathways,selectedPathways(reaction))
                                    });
                                    oppositeLink.double = true;
                                    oppositeLink.pathways = _.intersection(oppositeLink.pathways, selectedPathways(reaction));
                                } else {
                                    links.push({
                                        source: component, target: right,
                                        pathways: selectedPathways(reaction)
                                    });
                                }
                            }
                        }
                    });
                }
            });


        });

        _forceLayoutLinks = links;
    };


    var createNextElements = function () {
        _allComponents.forEach(function (component) {
            component.nextComponents = [];
            component.previousComponents = component.previousComponents || [];

            _reactions.forEach(function (reaction) {
                if(reaction.left.indexOf(component) > -1){
                    var right = reaction.right.filter(function(d){return d.type == "complex" || d.type == "protein" });
                    component.nextComponents = _.union(component.nextComponents, right);

                    right.forEach(function (r) {
                        r.previousComponents = r.previousComponents || [];
                        r.previousComponents = _.union(r.previousComponents, [component]);
                    });
                }
            })
        });
    };


    var computeVisibleComponentAndReactions = function(){
        _visibleComponents = [];
        _visibleReactions = [];
        _pathways.forEach(function (pathway) {
            if(pathway._selected){

                var filteredComponents = pathway.allComponents.filter(function(component){
                    //expanded
                    if(component._explored || component._visible){
                        setComponentVisibility(component, true); //XXX
                        return true;
                    } else{
                        //match searching criteria
                        for(var i = 0; i < _nameFilters.length; i++){
                            var filter = _nameFilters[i];
                            if(component.name.toLowerCase().indexOf(filter.toLowerCase()) > -1){
                            //if(component.name.toLowerCase().indexOf(filter.toLowerCase()) == 0){
                                setComponentVisibility(component, true); //XXX
                                return true;
                            }
                        }
                        return false;
                    }
                });

                _visibleComponents = _.union(_visibleComponents, filteredComponents);
                _visibleReactions = _.union(_visibleReactions, pathway.allReactions);
            }
                
        });

        _.difference(_allComponents, _visibleComponents)
            .forEach(function (c) {setComponentVisibility(c,false)});

    };


    //## PUBLIC FUNCTIONS


    self.getComponentsByName = function (name) {
        var components = [];
        _pathways.forEach(function (pathway) {
            var filteredComponents = pathway.allComponents.filter(function(component){
                if(component.name.toLowerCase().indexOf(name.toLowerCase()) > -1){
                    return true;
                }else return false;
            });
            components = _.union(components, filteredComponents);
        });
        return components;
    };

    self.setDataset = function(proteins, complexes, reactions, pathways) {
        _proteins = proteins;
        _complexes = complexes;
        _reactions = reactions;
        _pathways = pathways;
        _allComponents = _proteins.concat(_complexes);

        _pathways.forEach(function (pw) {pw._highlighted = true});

        createNextElements();
        computeVisibleComponentAndReactions();
        createLinks();

        updateForceLayoutNodesAndLinks();

        updateComplexesAndProteinsElements();
        updateReactionsElements();

        highlightPathways();

        updateLayout();
        updateLabels();
    };

    self.updateContext = function(){

        computeVisibleComponentAndReactions();
        createLinks();
        updateForceLayoutNodesAndLinks();

        updateComplexesAndProteinsElements();
        updateReactionsElements();

        hideLabels();
        highlightPathways();

        updateLayout();
        updateLabels();
    };

    self.updateFilters = function(filters){
        _nameFilters = filters;
        self.updateContext();
    };


    var init = function(){
        initElements();
        initForceLayout();
        initActions();
    }();


    return self;
}

