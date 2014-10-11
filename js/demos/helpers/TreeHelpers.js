var TreeHelpers = {};


TreeHelpers.buildNodes = function(startAngle,angle,clustersNumber,elementsPerCluster,randomness) {
    randomness = randomness || 5;
    var nodes = [] ;
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
};

TreeHelpers.animateNodes = function(nodes, distance) {

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
};

