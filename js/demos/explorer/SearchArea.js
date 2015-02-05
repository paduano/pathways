var SearchArea = function(){
    var self = UIDivView();

    self.onFiltersChanged = null;

    self.filters = [];

    var filtersDiv, inputJElement;

    var addFilter = function(value) {

        if(value.length == 0)
            return;

        self.filters.push(value);

        var element = filtersDiv.selectAll(".search-element").data(self.filters).enter()
                .append("div")
                .classed("search-element", true)
                .classed("filter-element", true)
                .text(function(d){return d});

        var closeIcon = element.append("img")
                            .classed("filter-close-icon", true)
                            .attr("src", "resources/img/blank.png")
                            .on("click", removeFilter);


        inputJElement.val("");

        if(self.onFiltersChanged)
            self.onFiltersChanged();
    };


    var removeFilter = function(filter){
        self.filters = _.without(self.filters, filter);
        d3.selectAll(".filter-element").filter(function(d){return d === filter}).remove();

        if(self.onFiltersChanged)
            self.onFiltersChanged();
    };


    var init = function() {

        self.classed("demo-explorer-search-area", true)
            .style("padding-top", "14px")
            .style("padding-left", "14px");

        //append input box
        var filterDiv = self.append("div")
            .html("<input type=\"text\" name=\"search\" placeholder=\"search\" id=\"search-box\">");


        filtersDiv = filterDiv.append("div").classed("filters-area", true);


        inputJElement = $(filterDiv.select("input")[0]);

        inputJElement.keyup(function(e){
            if(e.keyCode == 13)//enter
            {
                addFilter($(this).val());
            }
        });


    }();



    return self;
};