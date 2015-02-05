var PathwaysGraphDrawingUtils = {};

PathwaysGraphDrawingUtils.link = function (link) {
    var thick = 5,
        shift = 0,
        margin = 1;


    var start = vec2(link.source.x, link.source.y),
        end = vec2(link.target.x, link.target.y);


    var length = end.subV(start).length() - margin*2;
    var parallel = end.subV(start).normalize();
    var perpendicular = parallel.clone().perpendicular().normalize();
    var arrowTip = 1;

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