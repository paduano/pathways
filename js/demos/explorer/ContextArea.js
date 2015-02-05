var ContextArea = function(){
    var self = UIDivView();

    var pathways = [];

    var colorScale = d3.scale.category10();

    var elementsList;

    //callbacks
    self.onContextChange = null;


    self.addContext = function(pathway) {
        pathway.color = colorScale(pathway.name);

        pathways.push(pathway);
        var element = elementsList.selectAll(".context-element").data(pathways).enter()
            .append("li")
            .append("div")
            .classed("filter-element", true)
            .classed("context-element", true)
            .style("background-color", pathway.color)
            .text(function(d){return d.name})
            .on("click", function (d) {
                d._selected = !d._selected;
                d3.select(this).classed("context-element-deselected", !d._selected);
                if(self.onContextChange){
                    self.onContextChange();
                }
            });

    };


    var init = function() {

        self.classed("demo-explorer-context-area", true)
            .style("padding-top", "14px")
            .style("padding-left", "14px");

        //append input box
        var filterDiv = self.append("div");

        filterDiv.append("h3").text("Context");

        elementsList = filterDiv.append("ul");


    }();



    return self;
};