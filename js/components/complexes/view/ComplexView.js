var ComplexView = function() {
    var self = UIGView();

    var _circle;

    self.__defineGetter__("radius", function(){
        var r =  _circle.attr("radius");
        return r ? parseFloat(r) : 0;
    });

    self.__defineSetter__("radius", function(r){
        _circle.attr("r",r);
    });


    var init = function() {
        self.classed("complex-view", true);

        _circle =
            self.append("circle")
            .attr("cx",0)
            .attr("cy",0)
            .attr("stroke","#FFFFFF")
            .attr("stroke-width",0.2)
            .attr("r",10);
    }();


    return self;
};