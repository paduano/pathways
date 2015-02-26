
/**
 * DEMO
 */



function DemoParallaxGraph (containerSvg) {
    var self = this;


    var _running = false;
    var _loopInterval;

    var svg = containerSvg;
    var container;

    var width = 500,
        height = 500;

    var nodes,
        links;

    var linkSelection,
        nodeSelection;


    this.start = function() {
    };

    this.stop = function() {
    };


    //### helpers
    function flatten(root) {
        var nodes = [], i = 0;

        function recurse(node) {
            if (node.children) node.children.forEach(recurse);
            if (!node.id) node.id = ++i;
            nodes.push(node);
        }

        recurse(root);
        return nodes;
    }

    var nodeDegree = function(node, links){
        var i = 0;
        links.forEach(function (l) {
            if(l.source == node || l.target == node){
                i++;
            }
        });
        return i;
    };

    //### Set up functions

    var setUp = function() {
        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on("zoom", zoomed);


        svg.attr("viewBox","0 0 600 600");
        svg.attr("preserveAspectRatio", "xMidYMid meet");
        svg.classed("parallax-demo", true);
        svg.attr({
                x:0, y:0, width:"80%", height:"80%"}
        );

        var g = svg
            .append("g")
            .attr("transform", "translate(" + [0,0] + ")")
            .call(zoom);

        var rect = g.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all");

        container = g.append("g");


        var drag = d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);

        var force = d3.layout.force()
            .size([width, height])
            .charge(-400)
            .linkDistance(40)
            .on("tick", tick);


        linkSelection = container.selectAll(".link");
        nodeSelection = container.selectAll(".node");

        d3.json("resources/demos/graph/graph.json", function(error, graph) {
            nodes = graph.nodes;//flatten(graph),
            links = graph.links;//d3.layout.tree().links(nodes)

            force
                .nodes(nodes)
                .links(links)
                .start();

            nodes = _.sortBy(nodes, function (node){return node.depth});

            nodes.forEach(function (d) {
                d.depth = nodeDegree(d, links) ;
            });

            linkSelection = linkSelection.data(links)
                .enter().append("line")
                .attr("class", "link");

            nodeSelection = nodeSelection.data(nodes)
                .enter().append("circle")
                .attr("class", "node")
                .attr("r", 12);

            nodeSelection.each(function (d) {
                d.dx = 0;
                d.dy = 0;
            });
        });


        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', function () {
                var rotation = event.rotationRate;
                var x,y;

                if(rotation.alpha < 0.6)
                    x = 0;
                else
                    x = rotation.alpha * 10;

                if(rotation.beta < 0.3)
                    y = 0;
                else
                    y = rotation.beta * 10;
                parallaxPan(x,y);
            }, true);
        }

    };


    function zoomed() {
        //container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        //container.attr("transform", "scale(" + d3.event.scale + ")");
        //nodeSelection.each(function (d) {
        //    var tr = d3.event.translate;
        //    d.dx = tr[0]* (1/Math.sqrt(d.depth));
        //    d.dy = tr[1]* (1/Math.sqrt(d.depth));
        //}) ;

        //tick();
    }


    function tick() {
        linkSelection.attr("x1", function(d) { return d.source.x + d.source.dx; })
            .attr("y1", function(d) { return d.source.y + d.source.dy; })
            .attr("x2", function(d) { return d.target.x + d.target.dx; })
            .attr("y2", function(d) { return d.target.y + d.target.dy; });

        nodeSelection.attr("cx", function(d) { return d.x + d.dx; })
            .attr("cy", function(d) { return d.y + d.dy; })
            .attr("r", function (d) {
                var dist = vec2(d.dx, d.dy).length();
                var diff = (0.005 * dist)*(d.depth - 3);
                if(diff < 0){
                    return 12 - Math.max(diff, -6);
                } else {
                    return 12 - Math.min(diff, 6);
                }
            });

    }

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


    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    function dragended(d) {
        d3.select(this).classed("dragging", false);
    }

    function parallaxPan(dx,dy) {
        console.log(dx,dy);
        nodeSelection.each(function (d) {

            d.dx += dx* (1/Math.sqrt(d.depth));
            d.dy += dy* (1/Math.sqrt(d.depth));
        }) ;

        tick();
    }

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
DemoParallaxGraph.demoTitle = "Parallax Graph";
DemoParallaxGraph.demoDescription = "" ;
DemoParallaxGraph.theme = "light-theme";