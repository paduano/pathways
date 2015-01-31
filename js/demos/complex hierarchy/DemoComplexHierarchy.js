/**
 * DEMO
 */



function DemoComplexHierarchy (containerSvg) {

    var eventDispatch = d3.dispatch(
        "pathwaysSelectionChanged"
    );

    var self = this;

    var _parser;
    var _circularLayout;
    var _mainComplex,
        _mainComponentNode,
        _innerComplexNode;

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

    var generateLinksFromComplex = function(root, setOfAllowedComponents, links, skipRoot){
        var links = links || [];

        var skipRoot = skipRoot == undefined ? true : false;

        root.components.forEach(function(c){
            if(setOfAllowedComponents.indexOf(c) != -1){
                generateLinksFromComplex(c, setOfAllowedComponents, links, false);
                if(!skipRoot)
                    links.push({source: root, target: c});
            }
        });

        return links;

    };

    //### Set up functions

    var setUp = function() {

        svg.attr("viewBox","0 0 600 600");
        svg.attr("preserveAspectRatio", "xMidYMid meet");
        svg.attr({
            x:0, y:0, width:"100%", height:"100%"}
        );

        //
        _circularLayout = ComplexCircularLayout(_mainComplex, 10, 20);
        //

        var links = generateLinksFromComplex(_mainComplex, _mainComplex.allComplexes);

        var mainG = svg.append("g").attr("transform","translate(0,0)");
        var mainComponent = mainG.selectAll(".main-complex").data([_mainComplex]);

        //Main component
        _mainComponentNode = mainComponent.enter().append("g");

        _mainComponentNode
            .append("g")
            .classed("g-smooth-tree",true);


        _mainComponentNode
            .each(function(complex, i){
                complex._expanded = false;
                complex._color = Colors.pathways[i];
            })
            .append("circle")
            .classed("main-complex", true)
            .attr({
                r:10,
                "fill" : function(d,i){
                    return d._color
                },
                "fill-opacity" : 1,
                "stroke-width" : 0,
                "stroke"  : function(d,i){
                    return d._color
                }
            })
            .on("click", openCloseMainNode);


        //add complexes
        _innerComplexNode = _mainComponentNode.selectAll(".inner-complex").data(_mainComplex.allComplexes)
            .enter().append("g")
            .attr("pointer-events", "visiblePainted")
            .on("click", openCloseNode);

        _innerComplexNode
            .each(function(complex, i){
                complex._expanded = false;
                complex._visible = false;
                complex._color = Colors.pathways[1];
            })
            .append("circle")
            .classed("inner-complex", true)
            .attr({
                r:5,
                "fill" : function(d,i){
                    return d._color
                },
                "fill-opacity" : 1,
                "stroke-width" : 0,
                "stroke"  : function(d,i){
                    return d._color
                }
            });

        //Links
        //var componentLinks = _mainComponentNode.selectAll(".link-complex").data(links)
        //    .enter().append("g");
        //
        //var linePath = d3.svg.line().x(function(d){return d._x})
        //                            .y(function(d){return d._y});
        //
        //componentLinks
        //    .append("path")
        //    .classed(".link-complex", true)
        //    .attr({
        //        d : function(link){return linePath([link.source, link.target])},
        //        "fill" : "none",
        //        "stroke-width" : 1,
        //        "stroke"  : "gray"
        //        }
        //    );
        updateNodeVisibility(_mainComponentNode);
        update();

    };

    var update = function(){

        _mainComponentNode.attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";});
        _innerComplexNode.attr("transform",
            function (d) {
                if(d._visible)
                    return "translate(" + [d._x, d._y] + ")";
                else return "translate(0,0)";
            });
    };

    var updateNodeVisibility = function (mainNode) {
        mainNode.selectAll(".inner-complex")
            .attr("opacity", function (d) {return d._visible? 1 : 0})
            .attr("visibility", function (d) {return d._visible? "visible" : "hidden"});
    };


    var openCloseMainNode = function(complex){
        var complexNode = d3.select(this);
        var groupNode = d3.select(this.parentNode);

        if(complex._expanded){
            complex._expanded = false;
            hideInnerComplexNodes(groupNode);
            _circularLayout.computeVisibleLayout();
            closeMainNode();
            removeTrees(groupNode);
        } else {
            complex._expanded = true;
            showInnerComplexNodes(groupNode);
            _circularLayout.computeVisibleLayout();
            expandMainNode();
            drawTrees(groupNode);
        }

        updateNodeVisibility(groupNode);
        update();
    };


    var openCloseNode = function(complex){

        var complexNode = d3.select(this);
        var groupNode = d3.select(this.parentNode);
        var mainComplexNode = d3.select();

        if(complex._expanded){
            complex._expanded = false;
            hideInnerComplexNodes(complexNode);
            _circularLayout.computeVisibleLayout();
            expandMainNode();
        } else {
            complex._expanded = true;
            showInnerComplexNodes(groupNode);
            _circularLayout.computeVisibleLayout();
            expandMainNode();
        }

        updateNodeVisibility(groupNode);
        removeTrees(groupNode);
        drawTrees(groupNode);

        update();
    };


    var expandMainNode = function(){

        _mainComponentNode.select(".main-complex").transition().attr(
            {   r: _circularLayout.externalRadius,
                "fill-opacity" : 0,
                "stroke-width" : 4
            }
        );
    };

    var closeMainNode = function(complexNode){

        _mainComponentNode.select(".main-complex").transition().attr(
            {   r: 10,
                "fill-opacity" : 1,
                "stroke-width" : 0
            }
        );
    };


    var loadAssets = function(callback) {
        var request = d3.xml("resources/demos/owl/1_RAF-Cascade.owl", "application/xml", function(d) {
            _parser = BiopaxParser(d3.select(d));
            window.parser = _parser;//


            //fake main complex
            _mainComplex = createDummyComplex([4,5,4,7], 3);
            _mainComplex.x = _width/2;
            _mainComplex.y = _height/2;
            window.c = _mainComplex;

            callback(null,null);
        });



    };


    //Trees
    var drawTrees = function(mainNode){

        mainNode.datum().components.filter(function(d){return d.type == "complex"}).forEach(function (c) {
            ////Tree
            var _root  = new Joint(vec2(_circularLayout.externalRadius, 0).rot(toRad(c._startAngle + (c._endAngle - c._startAngle) / 2)));
            c._joint = new Joint(new Vec2(c._x, c._y));

            new Branch(_root, c._joint);

            c.allComplexes.forEach(function (el) {
                var joint  = new Joint(new Vec2(el._x, el._y));
                el._joint = joint;
            });

            generateLinksFromComplex(c, c.allComplexes, [], false).forEach(function (link) {
                if(link.source._visible && link.target._visible)
                    new Branch(link.source._joint, link.target._joint);
            });

            var rend1 = new TreeRender(mainNode.select(".g-smooth-tree") ,
                new JointsSystem(_root),
                {
                    "flatBase":false,
                    "baseWidth":10,
                    "handleDistance":20,
                    "endBranchesThickness":1,
                    "straightEndBranches":true
                }
            );
            rend1.path.classed("tree-path",false)
                .attr("fill", "red")
                .attr("opacity",0.5);

            rend1.draw();
        });
    };


    var removeTrees = function(mainNode) {
        mainNode.selectAll(".smooth-tree").remove();
    };


    var showInnerComplexNodes = function(mainNode) {

        function setVisibility(element){
            element._visible = true;
            if(element._expanded){
                element.components.forEach(function (e) {
                    setVisibility(e);
                })
            }
        }

        setVisibility(mainNode.datum());
    };


    var hideInnerComplexNodes = function(mainNode) {

        mainNode.datum().allComplexes.forEach(function (c) {
            c._visible = false;c._expanded = false;
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
DemoComplexHierarchy.demoTitle = "Complex Hierarchy";
DemoComplexHierarchy.demoDescription = "" ;
DemoComplexHierarchy.theme = "dark-theme";