/**
 * DEMO trees around a node, connected to other nodes
 */
function DemoPlainTree (containerSvg) {
    var self = this;

    var jsys1;

    var rend1;

    var nodes;
    var _running = false;
    var _loopInterval;

    var svg = containerSvg;

    this.start = function() {
        drawLoop();
    };

    this.stop = function() {
        if(_running){
            _running = false;
            clearInterval(_loopInterval);
        }
    };

    var setUp = function() {

        svg.attr("viewBox","-70 -100 120 120");

        //BUILD

        nodes = [];

        var root1 = vec2(0,0);
        var treeBuilder1 = new TreeBuilder();
        nodes = TreeHelpers.buildNodes(Math.PI, 1.2, 5, 4,15);
        jsys1 = treeBuilder1.buildTree(root1,nodes );
        rend1 = new TreeRender(svg ,jsys1,{"flatBase":true});
        //Nodes


//        nodes.forEach(function(node){svg.append(node.getBottomElement())});

  //      nodes.forEach(function(node){svg.append(node.getTopElement())});

    };


    var drawLoop = function() {
        //LOOP

        _loopInterval = setInterval(loop, 10);

        function loop( )
        {
            jsys1.update(0.030);
            rend1.drawSekeleton();
            rend1.draw();

        }
    };

    var init = function() {
        setUp();
    } ();
}

//PARAMS
DemoPlainTree.demoTitle = "PlainTrees Demo";
DemoPlainTree.demoDescription = "This demo shows a dynamically generated trees using svg.  " +
                                "Drag and drop the leaves to move the branches.  " +
                                "The (pretty simple) physic engine has been developed from scratch.";
