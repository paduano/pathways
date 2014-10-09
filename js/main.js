$(document).ready(function() {

    var svg = d3.select("body")
                .append("svg")
                .attr("viewBox","-50 -80 100 100")
                .attr("width", "800px")
                .attr("height", "700px");
/*
    var root  = new Joint(new Vec2( 0,0));
    var jointB = new Joint(new Vec2( 0,15));
    var jointC = new Joint(new Vec2( -5,25));
    var jointD = new Joint(new Vec2(-10,35));
    var jointE = new Joint(new Vec2( -15,40));
    var jointF = new Joint(new Vec2( -12,42));
    var jointG = new Joint(new Vec2( -7,40));
    var jointH = new Joint(new Vec2( -5,35));
    var jointI = new Joint(new Vec2( -5,40));
    var jointL = new Joint(new Vec2( -2,35));
    var jointM = new Joint(new Vec2( -2,40));

    var jointN = new Joint(new Vec2( 20,35));
    var jointO = new Joint(new Vec2( 20,42));
    var jointP = new Joint(new Vec2( 25,40));
    var jointQ = new Joint(new Vec2( 22,50));
    var jointR = new Joint(new Vec2( 30,48));
    var jointS = new Joint(new Vec2( 40,37));
    var jointT = new Joint(new Vec2( 44,40));
    var jointU = new Joint(new Vec2( 46,38));

    new Branch(root, jointB);
    new Branch(jointB, jointC);
    new Branch(jointC, jointD);
    new Branch(jointD, jointE);
    new Branch(jointD, jointF);
    new Branch(jointD, jointG);
    new Branch(jointC, jointH);
    new Branch(jointH, jointI);
    new Branch(jointC, jointL);
    new Branch(jointL, jointM);

    new Branch(jointB, jointN);
    new Branch(jointN, jointO);
    new Branch(jointN, jointP);
    new Branch(jointP, jointQ);
    new Branch(jointP, jointR);
    new Branch(jointN, jointS);
    new Branch(jointS, jointT);
    new Branch(jointS, jointU);
*/

    //GENERATE NODES IN A CIRCLE

    var nodes = [] ;

    var ray = vec2(0, 50);
    var angle = 1.4;
    var clustersNumber = 3;
    var elementsPerCluster = 4;

    ray.rot(angle);

    var step = (angle*2)/(clustersNumber*elementsPerCluster + clustersNumber*2);

    ray.rot(0.2);

    for(var i = 0; i< clustersNumber;i++){
        var cluster = [];
        for(var j=0;j< elementsPerCluster;j++){
            //cluster.push(ray.clone().addV(vec2(Math.random()*3, Math.random()*3)));
            nodes.push(ray.clone().addV(vec2(Math.random()*3, Math.random()*3)));
            ray.rot(-step);
        }
        //nodes.push(cluster);
       ray.rot(-step*2);
    }

    //BUILD

    var root = vec2(0,0);

    //var jsys = new JointsSystem(root);
    var treeBuilder = new TreeBuilder();
    var jsys = treeBuilder.buildTree(root, nodes);

    var rend = new TreeRender(svg ,jsys);


    //LOOP

    setInterval(loop, 10);

    function loop( )
    {
        jsys.update(0.030);
        rend.drawSekeleton();
        rend.draw();
    }
});