var ContextArea = function(){
    var self = UIDivView();

    var pathways = [];

    var colorScale = d3.scale.category10();

    var elementsList;

    var colors = ['#1f78b4','#33a02c','#e31a1c', '#ff7f00', '#6a3d9a','#b15928'];
    var availableColors = colors;

    //callbacks
    self.onContextChange = null;


    self.addContext = function(pathway) {
        pathways.push(pathway);
        self.updateContext();
    };

    self.updateContext = function () {
        var element = elementsList.selectAll(".context-element").data(pathways);

        element.enter()
            .append("li")
            .append("div")
            .classed("filter-element", true)
            .classed("context-element", true)
            .classed("context-element-deselected", function (p) {return !p._selected})
            .style("margin-left", function (d) {
                return getPathwayDepth(d)*10 + 'px';
            })
            .text(function(d){return d.name})
            .on("click", function (d) {
                if(event.shiftKey){
                    //invert
                    var turnVisible = true;
                    pathways.forEach(function (p) {
                        if(p != d && p._selected){
                            turnVisible = false;
                        }
                    });

                    if(turnVisible){
                        pathways.forEach(function (p) {
                            self.selectPathway(p);
                        });
                    } else {
                        elementsList.selectAll(".context-element").each(function(p){
                            if(p != d){
                                self.deselectPathway(p);
                            }
                        });
                        self.selectPathway(d);
                    }

                    if(self.onContextChange){
                        self.onContextChange();
                    }
                } else {
                    if(d._selected){
                        self.deselectPathway(d);
                    } else {
                        self.selectPathway(d);
                    }
                    if(self.onContextChange){
                        self.onContextChange();
                    }
                }

                self.updateContext();
            });

        elementsList.selectAll(".context-element")
            .classed("context-element-deselected", function (p) {return !p._selected})
            .style("background-color", function (p) {return getPathwayColor(p)});
    };

    self.selectOnlyRoots = function () {
        pathways.forEach(function (p) {
            if(p.parent){
                self.deselectPathway(p);
            } else {
                self.selectPathway(p);
            }
        });
        self.updateContext();
    };

    self.selectPathway = function (pathway) {
        pathway._selected = true;
        if(availableColors.indexOf(pathway.color) > -1) {
            availableColors = _.without(availableColors, pathway.color);
        } else {
            pathway.color = availableColors[0];
            availableColors = _.without(availableColors, pathway.color);
        }
    };

    self.deselectPathway = function (pathway) {

        pathway._selected = false;
        if(pathway.color){
            availableColors = _.union(availableColors, [pathway.color])
        }
    };


    var getPathwayDepth = function (pathway) {
        var deep = 0;

        while(pathway.parent){
            pathway = pathway.parent;
            deep++;
        }


        return deep;
    };


    var getPathwayColor = function (pathway) {

        do {
            if(pathway._selected) {
                return pathway.color;
            } else {
                if(pathway.parent)
                    pathway = pathway.parent;
            }
        } while(pathway.parent);

        if(pathway._selected)
            return pathway.color;
        else return 'gray';
    };

    var assignColor = function(pathway){

    };


    var init = function() {

        self.classed("demo-explorer-context-area", true)
            .style("padding-top", "14px")
            .style("padding-left", "14px");



        //append input box
        var filterDiv = self.append("div");

        filterDiv.append("h3").text("Field of Interest");

        elementsList = filterDiv.append("ul");


    }();



    return self;
};