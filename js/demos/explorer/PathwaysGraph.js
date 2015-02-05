function PathwaysGraph() {
    var self = UISvgView();

    //Parameters
    var _width = 500, _height = 500;

    //filters
    var _nameFilters = [];

    //D3 Tools

    var _componentsForceLayout;


    //D3 elements
    var _gComponents,
        _gReactions,
        _allComponentElements,
        _allLinkElements,
        _complexElements,
        _proteinElements;


    //Components

    var _visibleComponents,
        _allComponents,
        _proteins,
        _complexes,
        _reactions,
        _visibleReactions,
        _pathways;

    var _selectedComponents = [],
        _forceLayoutLinks;



    //## PRIVATE FUNCTIONS


    //D3 helpers functions

    var componentKey = function(c){return c.name};
    var reactionKey = function(c){return c.source.name + c.target.name + c.pathways.length}; //XXX wrong
    var getSelectedPathways = function(p){return p.pathways.filter(function(pw){return pw._selected})};
    //var isComponentSelected = function(p){return getSelectedPathways(p).length > 0};
    var proteinRadius = PathwaysGraphDrawingUtils.proteinRadius;
    var complexSize = PathwaysGraphDrawingUtils.complexSize;

    var forceLayoutChargeFunction = function(component){
        if(component._expanded){
            return -ComplexPackUtils.radiusFromComponent(component) * 100;
        } else {
            return -500;
        }
    };

    var getFillForComponent = function(d){
        //first pw selected
        var firstPathwaysSelected = getSelectedPathways(d)[0];
        if(firstPathwaysSelected){
            return firstPathwaysSelected.color;
        } else "black"//return d.type == "complex" ? Colors.deselected.complex : Colors.deselected.protein;;
    };

    var coloredCircleRadius = function(pathways, component){
        //remember to skip the first one, because the node itself is colored
        if(pathways._selected){
            var selectedPathways = getSelectedPathways(component);
            var indexOfSelected = selectedPathways.indexOf(pathways);
            if(indexOfSelected == 0) {
                return 0;
            } else {
                if(component.type == "complex"){
                    var baseRadius = complexSize(component) + selectedPathways.length * 4;
                    return selectedPathways.length > 0 ? baseRadius - indexOfSelected*4 : 0;
                } else {
                    var baseRadius = proteinRadius(component) + selectedPathways.length * 2 ;
                    return selectedPathways.length > 0 ? baseRadius - indexOfSelected*2 : 0;
                }

            }
        } else return 0;
    };

    //init helpers

    var initElements = function(){
        _gComponents = self.append("g");
        _gReactions = self.append("g");

    };


    var initForceLayout = function() {
        _componentsForceLayout =
            d3.layout.force()
            .size([_width, _height])
            .charge(forceLayoutChargeFunction)
            .gravity(0.2)
            .linkDistance(45)
            .friction(0.5)
            .on("tick", forceLayoutTick)

    };


    var updateForceLayoutNodesAndLinks = function(){
        _componentsForceLayout
            .nodes(_visibleComponents)
            .links(_forceLayoutLinks)
            .start();
    };


    var updateComplexesAndProteinsElements = function(){
        var components = _gComponents.selectAll(".pathway-component").data(_visibleComponents, componentKey);

        var newElements = components.enter()
            .append("g")
            .classed("pathway-component", true)
            .classed(function(d){return "pathway-" + d.type}, true);


        var enterComplexElements = newElements.filter(function(d){return d3.select(this).datum().type == "complex"});

        var enterProteinElements = newElements.filter(function(d){return d3.select(this).datum().type == "protein"});

        //colored circles
        var coloredCircleElement = enterProteinElements.selectAll(".protein-colored-circle").data(function(d){return d.pathways});

        coloredCircleElement.enter()
            .append("circle")
            .classed("protein-colored-circle",true)
            .attr({
                r:0,
                fill : function(pathway){return pathway.color},
                "stroke-width" : 0,
                "stroke" : "black"
            });

        //colored rectangles
        var coloredRectangleElement = enterComplexElements.selectAll(".complex-colored-rectangle").data(function(d){return d.pathways});
        coloredRectangleElement.enter()
            .append("rect")
            .classed("complex-colored-rectangle",true)
            .attr({
                rx : 3,
                ry : 3,
                fill : function(pathway){return pathway.color}
            })
            .attr("pointer-events", "all");


        enterProteinElements.append("circle")
            .classed("protein-circle",true)
            .attr({
                r: proteinRadius,
                "stroke-width" : 1
            })
            .attr("pointer-events", "all");


        enterComplexElements.append("rect")
            .each(function (d) {d._width = complexSize(d)})
            .classed("complex-rect",true)
            .attr({
                x: function(d){return -d._width/2},
                y: function(d){return -d._width/2},
                width: function(d){return d._width},
                height: function(d){return d._width},
                rx : 3,
                ry : 3
            })
            .attr("pointer-events", "all");

        //Remove
        components.exit().remove();


        //Update

        _allComponentElements = _gComponents.selectAll(".pathway-component");

        _complexElements = _allComponentElements.filter(function(d){
                return d3.select(this).datum().type == "complex"}
        );

        _proteinElements = _allComponentElements.filter(function(d){
                return d3.select(this).datum().type == "protein"}
        );


        //update colors
        _complexElements.selectAll(".complex-rect").attr("fill", getFillForComponent);
        _proteinElements.selectAll(".protein-circle").attr("fill", getFillForComponent);

        //colored circles sizes
        _proteinElements.selectAll(".protein-colored-circle")
            .attr({
                r: function(pw,i){ return coloredCircleRadius(pw, d3.select(this.parentNode).datum());}
            });

        _complexElements.selectAll(".complex-colored-rectangle")
            .each(function (pw) {this._width = coloredCircleRadius(pw, d3.select(this.parentNode).datum())})
            .attr({
                x: function(d){return -this._width/2},
                y: function(d){return -this._width/2},
                width: function(d){return this._width},
                height: function(d){return this._width}
            });


    };


    var updateReactionsElements = function() {


        var links = _gReactions.selectAll(".pathway-link").data(_forceLayoutLinks,reactionKey );

        var newLinks = links.enter()
            .append("g")
            .classed("pathway-link", true);


        newLinks.selectAll(".pathway-link-polygon").data(function(link){return link.pathways}).enter()
            .append("polygon")
            .classed("pathway-link-polygon", true)
            .attr({
                fill: function(pw){return pw.color}
            });

        links.exit().remove();

        _allLinkElements = _gReactions.selectAll(".pathway-link");

    };


    //Timing
    var forceLayoutTick = function() {
        updateElementsPosition();
    };


    var updateElementsPosition = function () {
        _allComponentElements.attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";});
        _allLinkElements.selectAll(".pathway-link-polygon")
            .attr({points: function(pw){ return PathwaysGraphDrawingUtils.link(d3.select(this.parentNode).datum(),pw)}});
    };


    //Graphics Elements


    //Processing

    var createLinks = function() {
        var links = [];

        function findSameLink(source, target){
            links.forEach(function(l){
                if(l.source == source && l.target == target)
                    return l;
            });
            return null;
        }

        _visibleComponents.forEach(function (component) {
            component.nextComponents = [];

            _visibleReactions.forEach(function (reaction) {
                if(reaction.left.indexOf(component) > -1){
                    var rights = reaction.right.filter(function(d){return d.type == "complex" || d.type == "protein" });
                    rights.forEach(function (right) {
                        if(_visibleComponents.indexOf(right) > -1) { //XXX NOT EFFICIENT. STORE in COMPONENT
                            //search if there is already a link
                            var existingLink = findSameLink(component,right);
                            if(existingLink){
                                existingLink.pathways.push(pathway)
                            } else links.push({source: component, target: right,
                                pathways:reaction.pathways.filter(function(pw){return pw._selected})});
                        }
                    });
                }
            });


        });

        _forceLayoutLinks = links;
    };

    var computeVisibleComponentAndReactions = function(){
        _visibleComponents = [];
        _visibleReactions = [];
        _pathways.forEach(function (pathway) {
            if(pathway._selected){

                var filteredComponents = pathway.allComponents.filter(function(component){
                    for(var i = 0; i < _nameFilters.length; i++){
                        var filter = _nameFilters[i];
                        if(component.name.toLowerCase().indexOf(filter.toLowerCase()) > -1){
                            return true;
                        }
                    }
                    return false;
                });

                _visibleComponents = _.union(_visibleComponents, filteredComponents);
                _visibleReactions = _.union(_visibleReactions, pathway.allReactions);
            }
                
        });
    };


    //## PUBLIC FUNCTIONS

    self.setDataset = function(proteins, complexes, reactions, pathways) {
        _proteins = proteins;
        _complexes = complexes;
        _reactions = reactions;
        _pathways = pathways;
        _allComponents = _proteins.concat(_complexes);


        computeVisibleComponentAndReactions();
        createLinks();

        updateForceLayoutNodesAndLinks();

        updateComplexesAndProteinsElements();
        updateReactionsElements();
    };

    self.updateContext = function(){

        computeVisibleComponentAndReactions();
        createLinks();
        updateForceLayoutNodesAndLinks();

        updateComplexesAndProteinsElements();
        updateReactionsElements();
    };

    self.updateFilters = function(filters){
        _nameFilters = filters;
        self.updateContext();
    };


    var init = function(){
        initElements();
        initForceLayout();
    }();


    return self;
}

