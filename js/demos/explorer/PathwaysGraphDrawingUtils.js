var PathwaysGraphDrawingUtils = {};


PathwaysGraphDrawingUtils.complexBaseSize = 15;
PathwaysGraphDrawingUtils.proteinRadius = function(p){return 7};
PathwaysGraphDrawingUtils.complexSize = function(c){
    if(c._expanded){
        return c._expandedSize;
    }else return PathwaysGraphDrawingUtils.complexBaseSize};

PathwaysGraphDrawingUtils.link = function (link, pathway) {
    var thick = 2,
        shift = link.pathways.indexOf(pathway) * thick * 2.1,
        margin = 5,
        arrowTip = 10;



    var start = vec2(link.source.x, link.source.y),
        end = vec2(link.target.x, link.target.y);

    //overlapping
    if(start.x == end.x && start.y == end.y){
        return '0,0';
    }

    var direction = end.subV(start).normalize();

    //start shift
    if(link.source.type == "complex"){
        start = start.addV(direction.mulS(PathwaysGraphDrawingUtils.complexSize(link.source)*0.5));
    } else if (link.source.type == "protein"){
        start = start.addV(direction.mulS(PathwaysGraphDrawingUtils.proteinRadius(link.source)*0.5));
    }

    //end shift

    if(link.source.type == "complex"){
        end = end.subV(direction.mulS(PathwaysGraphDrawingUtils.complexSize(link.target)*0.5));
    } else if (link.source.type == "protein"){
        end = end.subV(direction.mulS(PathwaysGraphDrawingUtils.proteinRadius(link.target)*0.5));
    }


    var length = end.subV(start).length() - margin*2;
    var parallel = end.subV(start).normalize();
    var perpendicular = parallel.clone().perpendicular().normalize();


    var newStart = start.addV(parallel.mulS(margin)).addV(perpendicular.mulS(shift));

   var v0,v1,v2,v3,v4,v5;


    if(!link.double){
        //single arrow
        v0 = newStart;
        v1 = vec2(newStart).addV(perpendicular.mulS(thick));
        v2 = v1.addV(parallel.mulS(length-arrowTip));
        v3 = vec2(newStart).addV(parallel.mulS(length));
        v5 = vec2(newStart).subV(perpendicular.mulS(thick));
        v4 = v5.addV(parallel.mulS(length-arrowTip));

    }else {
        //double arrow
        v0 = newStart;
        v1 = vec2(newStart).addV(perpendicular.mulS(thick)).addV(parallel.mulS(arrowTip));
        v2 = v1.addV(parallel.mulS(length-(arrowTip*2)));
        v3 = vec2(newStart).addV(parallel.mulS(length));
        v5 = vec2(newStart).subV(perpendicular.mulS(thick)).addV(parallel.mulS(arrowTip));
        v4 = v5.addV(parallel.mulS(length-(arrowTip*2)));

    }

    return  v0.toArray() + " " + v1.toArray() + " " +
        v2.toArray() + " " +
        v3.toArray() + " " +
        v4.toArray() + " " +
        v5.toArray();

};




PathwaysGraphDrawingUtils.linkArch = function (link, pathway) {

    var CURVED_LINKS = ExplorerSettings.curvedLinks;

    var thick = 2,
        shift = link.pathways.indexOf(pathway) * thick * 2.1,
        margin = 5,
        arrowTip = 10;



    var start = vec2(link.source.x, link.source.y),
        end = vec2(link.target.x, link.target.y);

    //overlapping
    if(start.x == end.x && start.y == end.y){
        return 'M 0,0';
    }

    var direction = end.subV(start).normalize();

    //start shift
    if(link.source.type == "complex"){
        start = start.addV(direction.mulS(PathwaysGraphDrawingUtils.complexSize(link.source)*0.5));
    } else if (link.source.type == "protein"){
        start = start.addV(direction.mulS(PathwaysGraphDrawingUtils.proteinRadius(link.source)*0.5));
    }

    //end shift

    if(link.source.type == "complex"){
        end = end.subV(direction.mulS(PathwaysGraphDrawingUtils.complexSize(link.target)*0.5));
    } else if (link.source.type == "protein"){
        end = end.subV(direction.mulS(PathwaysGraphDrawingUtils.proteinRadius(link.target)*0.5));
    }


    var length = end.subV(start).length() - margin*2;
    var parallel = end.subV(start).normalize();
    var perpendicular = parallel.clone().perpendicular().normalize();


    var newStart = start.addV(parallel.mulS(margin)).addV(perpendicular.mulS(shift));

    var v0,v1,v2,v3,v4,v5, mid1, mid2;

    var anchor1pre,anchor1post, anchor2pre, anchor2post;

    var radiusLength = length/20;
    var anchorLength = length/4;
    var tipShift = radiusLength/10;

    if(!CURVED_LINKS){
        radiusLength = 0;
        anchorLength = 0;
        tipShift = 0;
    }

    if(!link.double || link.double){
        //single arrow
        v0 = newStart;
        v1 = vec2(newStart).addV(perpendicular.mulS(thick));
        v2 = v1.addV(parallel.mulS(length-arrowTip)).addV(perpendicular.mulS(tipShift));
        v3 = vec2(newStart).addV(parallel.mulS(length));
        v5 = vec2(newStart).subV(perpendicular.mulS(thick));
        v4 = v5.addV(parallel.mulS(length-arrowTip)).addV(perpendicular.mulS(tipShift));
        mid1 = v1.addV(parallel.mulS(length/2-arrowTip)).addV(perpendicular.mulS(radiusLength));
        mid2 = v5.addV(parallel.mulS(length/2-arrowTip)).addV(perpendicular.mulS(radiusLength));

        anchor1pre = mid1.subV(parallel.mulS(anchorLength));
        anchor1post = mid1.addV(parallel.mulS(anchorLength));
        anchor2pre = mid2.addV(parallel.mulS(anchorLength));
        anchor2post = mid2.subV(parallel.mulS(anchorLength));
    }else {
        //double arrow
        v0 = newStart;
        v1 = vec2(newStart).addV(perpendicular.mulS(thick)).addV(parallel.mulS(arrowTip));
        v2 = v1.addV(parallel.mulS(length-(arrowTip*2)));
        v3 = vec2(newStart).addV(parallel.mulS(length));
        v5 = vec2(newStart).subV(perpendicular.mulS(thick)).addV(parallel.mulS(arrowTip));
        v4 = v5.addV(parallel.mulS(length-(arrowTip*2)));

    }

    return  "M " + v0.toArray()
        + " L" + v1.toArray()
        + " C " + v1.toArray() + ' ' + anchor1pre.toArray() + ' ' + mid1.toArray()
        + " C " + anchor1post.toArray() + ' ' + v2.toArray() + ' ' + v2.toArray()
        + " L " + v3.toArray()
        + " L " + v4.toArray()
        + " C " + v4.toArray() + ' ' + anchor2pre.toArray() + ' ' + mid2.toArray()
        + " C " + anchor2post.toArray() + ' ' + v5.toArray() + ' ' + v5.toArray() + " z";

};


PathwaysGraphDrawingUtils.pathFromLabelToNode = function(d){

    var point1 = [d._labelRect.x + d._labelRect.width, d._labelRect.y + d._labelRect.height - 3],
        point2 = [d._labelRect.x, d._labelRect.y + d._labelRect.height - 3];

    if(Math.abs(d._labelRect.x - d.x) < Math.abs(d._labelRect.x + d._labelRect.width - d.x) ){
        return d3.svg.line()([point1, point2, [d.x, d.y ]]);
    } else {
        return d3.svg.line()([point2, point1, [d.x, d.y ]]);
    }
};
