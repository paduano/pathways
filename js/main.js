
function buildNodes(startAngle,angle,clustersNumber,elementsPerCluster) {
    var nodes = [] ;

    var randomness = 5;
    var ray = vec2(0, 80);

    ray.rot(angle);

    var step = (angle*2)/(clustersNumber*elementsPerCluster + clustersNumber*2);

    ray.rot(startAngle);
    for(var i = 0; i< clustersNumber;i++){
        var cluster = [];
        for(var j=0;j< elementsPerCluster;j++){
            //cluster.push(ray.clone().addV(vec2(Math.random()*3, Math.random()*3)));
            var pos = ray.clone().addV(vec2(Math.random()*randomness, Math.random()*randomness));
            var node = new Node(5,"node"+nodes.length);
            node.setPosition(pos);
            node._originalPosition = pos;
            nodes.push(node);
            ray.rot(-step);
        }
        //nodes.push(cluster);
        ray.rot(-step*2);
    }
    return nodes;
}

function animateNodes(nodes, distance) {

    var direction = vec2(0,distance).rot(Math.random()*Math.PI*2);
    //Animations
    for(var i in nodes){
        var node = nodes[i];
        var duration = 1000 + 2000*Math.random();
        var delay = 2000*Math.random();
        var startPos = node._originalPosition;
        var randomDir = direction.rot(0.2);

        node.moveTo(startPos.addV(randomDir),duration,delay);
    }
}



$(document).ready(function() {

    var svg = d3.select("body")
                .append("svg")
                .attr("viewBox","-100 -100 200 200")
                .attr("preserveAspectRatio", "xMidYMin meet" )
                .attr("width", "100%")
                .attr("height", "100%");

    //GENERATE NODES IN A CIRCLE



    //BUILD

    var nodes = []

    var root1 = vec2(0,0);
    var treeBuilder1 = new TreeBuilder();
    nodes = buildNodes(0.1, 1.5, 4, 4);
    var jsys1 = treeBuilder1.buildTree(root1,nodes );
    var rend1 = new TreeRender(svg ,jsys1);

    var root2 = vec2(0,0);
    var treeBuilder2 = new TreeBuilder();
    var nodes2 = buildNodes(2.5, 0.7, 3, 4);
    var jsys2 = treeBuilder2.buildTree(root2, nodes2);
    nodes = nodes.concat(nodes2);
    var rend2 = new TreeRender(svg ,jsys2);

    var root3 = vec2(0,0);
    var treeBuilder3 = new TreeBuilder();
    var nodes3 = buildNodes(4.1, 0.7, 2,4);
    var jsys3 = treeBuilder3.buildTree(root3, nodes3);
    nodes = nodes.concat(nodes3);
    var rend3 = new TreeRender(svg ,jsys3);





    //Nodes
    var node = new Node(10,"Node");

    svg.append(node.getBottomElement());
    nodes.forEach(function(node){svg.append(node.getBottomElement())});

    svg.append(node.getTopElement());
    nodes.forEach(function(node){svg.append(node.getTopElement())});


    animateNodes(nodes,3);
    window.setInterval(function(){animateNodes(nodes,3);}, 3000);


    //LOOP

    setInterval(loop, 10);

    function loop( )
    {
        jsys1.update(0.030);
        rend1.drawSekeleton();
        rend1.draw();

        jsys2.update(0.030);
        rend2.drawSekeleton();
        rend2.draw();

        jsys3.update(0.030);
        rend3.drawSekeleton();
        rend3.draw();



    }
});