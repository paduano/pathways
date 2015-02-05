function SideMenu(pathways, eventDispatch) {
    var self = SvgViewController();
    var _pathways = pathways;


    var changeSelection = function(gNode, d, i){
        d._selected = !d._selected;
        gNode.select("circle")
            .attr("fill", function(d){return d._selected ? Colors.pathways[i] : "white"})
        eventDispatch.pathwaysSelectionChanged.apply();
    };

    var init = function() {

        _pathways.forEach(function(p){
            p._selected = false
        });
        _pathways[4]._selected = true;

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
                changeSelection(d3.select(this.parentNode), d, i);
            });
        entryGroup
            .append("text")
            .attr("fill","white")
            .attr("font-size", 10)
            .attr("cursor", "pointer")
            .attr("x", 14)
            .attr("y", function(d,i){return i*20 + 11})
            .text(function(d){return d.name})
            .on("click", function(d,i){
                changeSelection(d3.select(this.parentNode), d, i);
            });



    }();

    return self;

}
