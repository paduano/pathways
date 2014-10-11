/**
 * DEMO trees around a node, connected to other nodes
 */
function DemoCircularTrees (containerSvg) {
    var self = this;

    var jsys1,
        jsys2,
        jsys3;

    var rend1,
        rend2,
        rend3;

    var nodes;
    var _running = false;
    var _loopInterval;
    var _animationsInterval;

    var svg = containerSvg;

    this.start = function() {
        _running = true;
        TreeHelpers.animateNodes(nodes,3);
        _animationsInterval = window.setInterval(function(){TreeHelpers.animateNodes(nodes,3);}, 3000);
        drawLoop();
    };

    this.stop = function() {
        if(_running){
            _running = false;
            clearInterval(_loopInterval);
            clearInterval(_animationsInterval);
        }
    };

    var setUp = function() {

        //BUILD

        nodes = [];

        var root1 = vec2(0,0);
        var treeBuilder1 = new TreeBuilder();
        nodes = TreeHelpers.buildNodes(0.1, 1.5, 4, 4);
        jsys1 = treeBuilder1.buildTree(root1,nodes );
        rend1 = new TreeRender(svg ,jsys1);

        var root2 = vec2(0,0);
        var treeBuilder2 = new TreeBuilder();
        var nodes2 = TreeHelpers.buildNodes(2.5, 0.7, 3, 4);
        jsys2 = treeBuilder2.buildTree(root2, nodes2);
        nodes = nodes.concat(nodes2);
        rend2 = new TreeRender(svg ,jsys2);

        var root3 = vec2(0,0);
        var treeBuilder3 = new TreeBuilder();
        var nodes3 = TreeHelpers.buildNodes(4.1, 0.7, 2,4);
        jsys3 = treeBuilder3.buildTree(root3, nodes3);
        nodes = nodes.concat(nodes3);
        rend3 = new TreeRender(svg ,jsys3);





        //Nodes
        var node = new Node(10,"Node");

        svg.append(node.getBottomElement());
        nodes.forEach(function(node){svg.append(node.getBottomElement())});

        svg.append(node.getTopElement());
        nodes.forEach(function(node){svg.append(node.getTopElement())});

    };


    var drawLoop = function() {
        //LOOP
        var interval = 15;
        _loopInterval = setInterval(loop, interval);

        function loop( )
        {
            jsys1.update(interval/1000);
            rend1.drawSekeleton();
            rend1.draw();

            jsys2.update(interval/1000);
            rend2.drawSekeleton();
            rend2.draw();

            jsys3.update(interval/1000);
            rend3.drawSekeleton();
            rend3.draw();



        }
    };

    var init = function() {
        svg.attr("viewBox","-100 -100 200 200");
        setUp();
    } ();
}

//PARAMS
DemoCircularTrees.demoTitle = "CircularTrees Demo";
DemoCircularTrees.demoDescription = "This demo shows how to use the trees from the PlainTree Demo for connecting a central node to a set of nodes ";
