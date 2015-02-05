var PathwaysGraphDrawingUtils = {};


PathwaysGraphDrawingUtils.complexBaseSize = 15;
PathwaysGraphDrawingUtils.proteinRadius = function(p){return 7};
PathwaysGraphDrawingUtils.complexSize = function(c){return PathwaysGraphDrawingUtils.complexBaseSize + Math.min(3,c.allProteins.length)};

PathwaysGraphDrawingUtils.link = function (link, pathway) {
    var thick = 2,
        shift = link.pathways.indexOf(pathway) * thick * 2.1,
        margin = 5,
        arrowTip = 10;


    var start = vec2(link.source.x, link.source.y),
        end = vec2(link.target.x, link.target.y);

    var direction = end.subV(start).normalize();

    //start shift
    if(link.source.type == "complex"){
        start = start.addV(direction.mulS(PathwaysGraphDrawingUtils.complexSize(link.source)*0.5));
    } else if (link.source.type == "protein"){
        start = start.addV(direction.mulS(PathwaysGraphDrawingUtils.proteinRadius(link.source)*0.5));
    }

    //end shift

    if(link.source.type == "complex"){
        end = end.subV(direction.mulS(PathwaysGraphDrawingUtils.complexSize(link.source)*0.5));
    } else if (link.source.type == "protein"){
        end = end.subV(direction.mulS(PathwaysGraphDrawingUtils.proteinRadius(link.target)*0.5));
    }


    var length = end.subV(start).length() - margin*2;
    var parallel = end.subV(start).normalize();
    var perpendicular = parallel.clone().perpendicular().normalize();


    var newStart = start.addV(parallel.mulS(margin)).addV(perpendicular.mulS(shift));

    //FROM A TO B
    var v1 = vec2(newStart).addV(perpendicular.mulS(thick)) ,
        v2 = v1.addV(parallel.mulS(length-arrowTip)),
        v3 = vec2(newStart).addV(parallel.mulS(length)),
        v5 = vec2(newStart).subV(perpendicular.mulS(thick)),
        v4 = v5.addV(parallel.mulS(length-arrowTip))
        ;

    return  v1.toArray() + " " +
        v2.toArray() + " " +
        v3.toArray() + " " +
        v4.toArray() + " " +
        v5.toArray();

};