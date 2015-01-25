function SideMenu(pathways) {
    var self = SvgViewController();
    var _pathways = pathways;


    var init = function() {

        _pathways.forEach(function(p){p._selected = false});
        _pathways[2]._selected = true;
        _pathways[4]._selected = true;
        _pathways[5]._selected = true;

        self.view.classed("right-menu");

        var entry = self.view.selectAll(".pathway-entry").data(_pathways);

        var entryGroup = entry.enter()
            .append("g")
            .classed("pathway-entry", true);
        entryGroup
            .append("circle")
            .attr("r", 5)
            .attr("cx", 7 )
            .attr("cy", function(d,i){return i*20 + 7})
            .attr("fill", function(d,i){return d._selected ? Colors.pathways[i] : "white"})
            .attr("stroke-width", 1)
            .attr("stroke", "white")
            .on("click", function(d,i){
                d._selected = !d._selected;
                d3.select(this)
                    .attr("fill", function(d){return d._selected ? Colors.pathways[i] : "white"})
                eventDispatch.pathwaysSelectionChanged.apply();
            });
        entryGroup
            .append("text")
            .attr("fill","white")
            .attr("font-size", 10)
            .attr("x", 14)
            .attr("y", function(d,i){return i*20 + 11})
            .text(function(d){return d.name});


    }();

    return self;

}
