var ComplexPack = function(selection, structureSvg, onCloseComplex) {


    var createDataStructure = function(root) {

        var copyElement = function(element){
            return {name:element.name, type:element.type};
        };

        var newElement = copyElement(root);
        if(newElement.type == "complex"){
            newElement.components = [];
            root.components.forEach(function (c) {
                if(c.type == "complex" || c.type == "protein" )
                    newElement.components.push(createDataStructure(c));
            });
        }

        return newElement;
    };



    var self = {};
    var originalMainComplex = selection.datum();
    var mainComplex = createDataStructure(selection.datum());
    var packLayout;
    var g;
    var gLabel = structureSvg.append("g");
    var _elementCircle;

    var enlargedRadius = ComplexPackUtils.radiusFromComponent(originalMainComplex);
    var closedRadius = 20;

    //element currently over
    var overedElement = null;


    var getRadiusFromComponent = function(c){
        if(c.type == "protein"){
            return 10;
        } else if(c.type == "complex"){
            return 30;
        } if(c.type == "dummy"){
            return 1;
        } else{
            console.warn(c.type + " does not have a radius");
            console.log(c);
            return 10;
        }
    };


    var fillForComponent = function(c){
        if(c.type == "protein"){
            return Colors.selected.protein;
        } else if(c.type == "complex"){
            return Colors.sequentialSequence[8-c.depth];//net.brehaut.Color(Colors.qualitativeSequence[c.depth]).desaturateByRatio(0.7).lightenByRatio(0).toCSS();
            //if(c._expanded){
            //    return "gray"
            //} else{
            //    return "green"
            //}
        } else{
            console.warn(c.type + " does not have a radius");
            console.log(c);
            return "white";
        }
    };


    var setUp = function(){
        g = selection.selectAll(".component-node").data([{empty:true}]).enter().append("g").classed("component-node", true);
        g.attr("transform","translate(" + [-enlargedRadius, -enlargedRadius] + ")");

        packLayout = d3.layout.pack()
            .size([enlargedRadius*2, enlargedRadius*2])
            .padding(4)
            .value(getRadiusFromComponent)
            .children(function(d){{
                //return d._expanded  ? d.components : d.components
                if(d.type == "protein"){
                    return []
                } else if (d.type == "complex" && d.components.length == 1){
                    return d.components.concat({type : "dummy"});
                } else {
                    return d.components;
                }
            } });

        packLayout(mainComplex);

        var node = g.selectAll(".complex-pack-node")
            .data(packLayout.nodes(mainComplex).filter(function(d){return d.type != "dummy"}))
            .enter()
            .append("g")
            .attr("class", function(d) { return d.children ? "complex-pack-node" : "complex-pack-lead complex-pack-node"; });

        _elementCircle = node.append("circle")
            .classed("complex-pack-component-circle", function(d){return d === mainComplex})
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .attr("pointer-events","visiblepainted")
            .attr("fill", fillForComponent)
            .attr("stroke", function(d) {return d.type == "complex" ? "black":"none"; })
            .attr("r", 0)
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut)
            .on("click", openCloseMainNode);

        mainComplex._expanded = true;
        update();
    };


    var update = function(){

        //g.attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";});

        packLayout(mainComplex);

        var node = g.selectAll(".node").data(packLayout.nodes(mainComplex).filter(function(d){return d.type != "dummy"}));

        node
            .enter().append("g")
            .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
            .append("circle")
            .attr("r", function(d) {return 0; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


        _elementCircle
            .transition()
            .attr("r", function(d) {
                if(mainComplex._expanded) {
                    return d.r;
                } else {
                    if(d === mainComplex){
                        return closedRadius;
                    } else {
                        return 0
                    }
                }
            })
            .attr("fill", fillForComponent)
            .attr("stroke", function(d) {return d === mainComplex ?"black":"none"; })
            .attr("transform", function(d) {
                if(mainComplex._expanded)
                    return "translate(" + d.x + "," + d.y + ")";
                else {
                    if(d === mainComplex){
                        return "translate(" + d.x + "," + d.y + ")";
                    } else {
                        return "translate(" + mainComplex.x + "," + mainComplex.y + ")";
                    }
                }

            });

        //node.exit().remove();


    };


    var updateLabels = function(){
        gLabel.html("");

        if(overedElement){
            var overedComponent = overedElement.datum();
            var current = overedComponent;
            var componentsToRoot = [];
            var siblings = [];
            var interspace = 30;
            var dotsRadius = 6;

            do {
                if(current.parent){
                    current = current.parent;
                }
                componentsToRoot.push(current);
            } while(current.depth != 0);

            if(overedComponent.parent){
                siblings = overedComponent.parent.components;
            } else {
                siblings = [];
            }

            var labels = gLabel.selectAll(".label").data(componentsToRoot)
                .enter()
                .append("g")
                .classed("label", true)
                .attr("transform", function(d){
                    return "translate(" + 0 + "," + (d.depth * interspace) + ")";
                });


            var labelsText = labels.append("text")
                .attr("fill", "white")
                .attr("text-anchor", "end")
                .attr("font-size", "10px")
                .text(function(d){return d.name});


            //parents dots
            labels.append("circle")
                .attr("r", dotsRadius)
                .attr("cx", function(d){return dotsRadius + 4})
                .attr("cy", function(d){return -3})
                .attr("stroke-width", 1)
                .attr("stroke", "white")
                .attr("fill", fillForComponent);


            //get maximum length text
            var maxWidth = 0;
            labelsText.each(function () {
                var bbox = d3.select(this)[0][0].getBBox();
                maxWidth = maxWidth > bbox.width ? maxWidth : bbox.width;
            });


            gLabel.attr("transform", function(d){
                return "translate(" + (maxWidth) + "," + 30 + ")";
            });


            if(siblings.length > 0){

                var siblingGroup = gLabel.append("g")
                    .classed("labels-sibling-group", true);

                var siblingLabels = siblingGroup.selectAll(".label").data(siblings)
                    .enter()
                    .append("g")
                    .classed("label", true)
                    .attr("transform", function(d, i){
                        return "translate(" + 0 + "," + (i * 30) + ")";
                    });

                var siblingsText = siblingLabels.append("text")
                    .attr("fill", function(d){return d===overedComponent? Colors.overedElement: "white"})
                    .attr("text-anchor", "start")
                    .attr("font-size", "10px")
                    .attr("dx", dotsRadius * 2 + 2)
                    .style("text-decoration",function(d){return d===overedComponent? "underline" : "none"})
                    .text(function(d){return d.name});


                var siblingBbox = siblingGroup[0][0].getBBox();
                var siblingGroupY = (overedComponent.depth-1) * interspace - (siblingBbox.height / 2) + 10;
                siblingGroupY = siblingGroupY < 0 ? 0 : siblingGroupY;

                siblingGroup
                    .attr("transform", function(d){
                        return "translate(" + (50) + "," + (siblingGroupY) + ")";
                    });

                //labels circles
                siblingLabels.append("circle")
                    .attr("r", dotsRadius)
                    .attr("cx", function(d){return  4})
                    .attr("cy", function(d){return -3})
                    .attr("stroke-width", 1)
                    .attr("stroke", "white")
                    .attr("fill", function (d) {
                           if(d === overedComponent){
                                return Colors.overedElement;
                           }else{
                               return fillForComponent(d)
                           }
                    });

                var line = d3.svg.line();

                //lines
                //ver sibling
                siblingGroup
                    .append("path")
                    .attr("d", line([[-5,-10],[-5,siblingBbox.height - 4]]))
                    .attr("stroke", "white")
                    .attr("stroke-width", 1);

                //hor line sibling
                gLabel
                    .append("path")
                    .attr("d", line([[15,(overedComponent.depth-1) * interspace - 2],[45,(overedComponent.depth-1) * interspace - 2]]))
                    .attr("stroke", "white")
                    .attr("stroke-width", 1);
            }

            //sequence of lines
            var lines = gLabel.selectAll(".line-sequence").data(componentsToRoot.slice(1,componentsToRoot.length))
                .enter()
                .append("path")
                .classed("line-sequence", true)
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .attr("d", function(d){
                    return line([[dotsRadius + 4, d.depth * interspace + 3],[dotsRadius + 4, (d.depth+1) * interspace - 9]]);
                });

            //Dots


        }

    };


    var onMouseOver = function(d){

        overedElement = d3.select(this);

        overedElement.attr("fill", Colors.deselected.complex);

        updateLabels();
    };


    var onMouseOut = function(d){

        ////old overed
        if(overedElement){
            overedElement.attr("fill", fillForComponent);
        }
        overedElement = null;

        updateLabels();
    };


    //var openCloseNode = function(complex){
    //    if(complex._expanded){
    //        complex._expanded = false;
    //    } else {
    //
    //
    //        complex._expanded = true;
    //    }
    //
    //    update();
    //};

    var openCloseMainNode = function(complex){
        //
        ////var groupNode = d3.select(this.parentNode);
        //
        //if(mainComplex._expanded){
        //    mainComplex._expanded = false;
        //   // closeMainNode();
        //} else {
        //    //take the old value
        //    closedRadius = parseFloat(g.selectAll(".complex-pack-component-circle").attr("r"));
        //    mainComplex._expanded = true;
        //   // expandMainNode();
        //}
        //
        //update();
        _elementCircle.transition().attr("r",0).each("end",function(){g.remove()});
        onCloseComplex(originalMainComplex);
        gLabel.remove();
        d3.event.stopPropagation()
    };


    var expandMainNode = function(){

        g.select(".main-complex-circle").transition().attr(
            {   r: 30,
                "fill-opacity" : 0,
                "stroke-width" : 4
            }
        );
    };

    var closeMainNode = function(complexNode){

        g.select(".main-complex-circle").transition().attr(
            {   r: 10,
                "fill-opacity" : 1,
                "stroke-width" : 0
            }
        );
    };



    var init = function(){
        setUp();
        update()
    }();


    return self;
};

var ComplexPackUtils = {};
ComplexPackUtils.radiusFromComponent = function (component) {
    return Math.max(Math.sqrt(component.allComponents.length),2) * 10;
};