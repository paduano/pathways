function Node(size, text) {
    var self = this;
    var _position;

    var _topG,
        _bottomG;

    var _vel = vec2(0,0),
        _acc,
        _force,
        _mass;

    var _animating = false;

    this.moveTo = function(pos, duration, delay){
        var delay = delay || 0;
        _animating = true;
        _topG.transition()
            .duration(duration)
            .delay(delay)
            .attr("transform","translate(" + pos.toArray() + ")")
            .each("end", function(){
                _animating = false;
                _position = pos;
            });

        _bottomG.transition()
            .duration(duration)
            .delay(delay)
            .attr("transform","translate(" + pos.toArray() + ")");

    };

    this.update = function(deltaTime){
        //NOT TESTED
        _acc = _force * _mass;
        _vel += _acc.mulS(deltaTime);
        self.setPosition(_vel.mulS(deltaTime));
    };

    this.setVelocity = function(velocity) {
        _vel = velocity;
    };

    this.setPosition = function(pos) {
        _position = pos;
        _topG.attr("transform","translate(" + _position.toArray() + ")");
        _bottomG.attr("transform","translate(" + _position.toArray() + ")");
    };

    this.getPosition = function() {
        if(!_animating){
            return _position;
        } else {
            var match = (/translate\(([+|-]?[\d|\.]*),([+|-]?[\d|\.]*)\)/).exec(_topG.attr("transform"));
            if(match == null){
                return vec2(0,0);
            }
            else return vec2(parseFloat(match[1]),parseFloat(match[2]));
        }

    };

    this.getTopElement = function() {
        return function(){return _topG.node()};
    };

    this.getBottomElement = function() {
        return function(){return _bottomG.node()};
    };




    var draw = function() {
        _topG = d3.select(document.createElementNS(d3.ns.prefix.svg,"g"));
        _bottomG = d3.select(document.createElementNS(d3.ns.prefix.svg,"g"));


        //Circle
        _topG.append("circle")
            .classed("node-circle", true)
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", size);

        //Text
        _topG.append("text")
            .classed("node-text", true)
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy","0.34em")
            .attr("text-anchor","middle")
            .attr("font-size", size/2)
            .text(text);

        //Background Circle
        _bottomG.append("circle")
            .classed("node-circle-background", true)
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", size);
    };

    var init = function(){
        draw();
    }();
}