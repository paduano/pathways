function PathwaysGraph() {
    var self = UISvgView();

    //Parameters
    var _width = 500, _height = 500,
        proteinRadius = 10,
        _complexBaseSize = 20;


    //D3 Tools

    var _componentsForceLayout;


    //D3 elements
    var _gComponents,
        _gReactions,
        _allElements,
        _complexElements,
        _proteinElements;


    //Components

    var _visibleComponents,
        _allComponents,
        _proteins,
        _complexes,
        _reactions,
        _pathways;

    var _selectedComponents = [],
        _forceLayoutLinks;



    //## PRIVATE FUNCTIONS


    //D3 helpers functions

    var componentKey = function(c){return c.name};
    var getSelectedPathways = function(p){return p.pathways.filter(function(pw){return pw._selected})};
    //var isComponentSelected = function(p){return getSelectedPathways(p).length > 0};
    //var proteinRadius = function(p){return isComponentSelected(p)? 7 : 4;};
    var complexSize = function(c){return _complexBaseSize + Math.min(3,c.allProteins.length)};

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
                    var baseRadius = proteinRadius + selectedPathways.length * 2 ;
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
            .linkDistance(35)
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
            .classed(function(d){return "pathway-" + d.type}, true)


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

        _allElements = _gComponents.selectAll(".pathway-component");

        _complexElements = _allElements.filter(function(d){
                return d3.select(this).datum().type == "complex"}
        );

        _proteinElements = _allElements.filter(function(d){
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


    var updateLinksElements = function() {

    };


    //Timing
    var forceLayoutTick = function() {
        updateElementsPosition();
    };


    var updateElementsPosition = function () {
        _allElements.attr("transform",function (d) {return "translate(" + [d.x, d.y] + ")";});
    };


    //Graphics Elements

    var updateComponents = function() {

    };


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

            _reactions.forEach(function (reaction) {
                if(reaction.left.indexOf(component) > -1){
                    var rights = reaction.right.filter(function(d){return d.type == "complex" || d.type == "protein" });
                    rights.forEach(function (right) {
                        //search if there is already a link
                        var existingLink = findSameLink(component,right);
                        if(existingLink){
                            existingLink.pathways.push(pathway)
                        } else links.push({source: component, target: right, pathways:reaction.pathways});
                    });
                }
            });


        });

        _forceLayoutLinks = links;
    };

    var computeVisibleComponent = function(){
        _visibleComponents = [];
        _pathways.forEach(function (pathway) {
            if(pathway._selected)
                _visibleComponents = _.union(_visibleComponents, pathway.allComponents);
        });
    };

    //## PUBLIC FUNCTIONS

    self.setDataset = function(proteins, complexes, reactions, pathways) {
        _proteins = proteins;
        _complexes = complexes;
        _reactions = reactions;
        _pathways = pathways;
        _allComponents = _proteins.concat(_complexes);


        computeVisibleComponent();
        createLinks();
        updateForceLayoutNodesAndLinks();
        updateComplexesAndProteinsElements();
    };

    self.updateContext = function(){

        computeVisibleComponent();
        updateForceLayoutNodesAndLinks();
        updateComplexesAndProteinsElements();
    };


    var init = function(){
        initElements();
        initForceLayout();
    }();


    return self;
}