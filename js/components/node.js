function Node(size, text) {
    var self = this;
    var _position;

    var _topG,
        _bottomG;

    this.setPosition = function(pos) {
        _position = pos;
        _topG.attr("transform","translate(" + _position.toArray() + ")");
        _bottomG.attr("transform","translate(" + _position.toArray() + ")");
    };

    this.getPosition = function() {
        return _position;
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