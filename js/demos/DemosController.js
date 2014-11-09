//For debug purposes, the current demo is exposed globally
var demo = null;

function DemosController (demos) {

    var self = this;

    var _currentDemo;

    var _svgContainer,
        _detailsContainer,
        _descriptionContainer,
        _titleContainer,
        _titleDiv;

    var _demosNameMap = {};

    self.setUpDemo = function(demoName){

        if(_currentDemo){
            _currentDemo.stop();
        }

        _svgContainer.selectAll("*").remove();

        var demoClass = _demosNameMap[demoName];

        //set the theme class properties
        d3.select("body").attr("class","");
        if(demoClass.theme)
            d3.select("body").classed(demoClass.theme, true);

        _currentDemo = new demoClass(_svgContainer);

        demo = _currentDemo;

        _titleDiv.text(demoClass.demoTitle);
        _descriptionContainer.text(demoClass.demoDescription);
        _currentDemo.start()
    };

    var setUpDropDownMenu = function() {
        var titleBox = _titleContainer.append('div');
        titleBox.append("img").classed("demos-controller-dropdown-title-img",true);
        _titleDiv = titleBox.append('div')
            .classed("demos-controller-dropdown-title",true).text("title");


        var dropDownList = _titleContainer.append('div')
                        .classed("demos-controller-dropdown-list",true);

        var demoNames = [];
        for(var k in _demosNameMap)demoNames.push(k);


        dropDownList.selectAll("div").
                    data(demoNames)
                    .enter()
                    .append("div")
                    .classed("demos-controller-dropdown-list-element",true)
                    .text(function(d){return d;})
            .on("click",self.setUpDemo);

        $(_titleContainer[0]).mouseenter(function(){$(dropDownList[0]).stop();$(dropDownList[0]).slideDown()});
        $(_titleContainer[0]).mouseleave(function(){$(dropDownList[0]).stop();$(dropDownList[0]).slideUp()});

        $(dropDownList[0]).hide();
    };

    var init = function() {

        for(var d in demos){
            var demo = demos[d];
            _demosNameMap[demo.demoTitle] = demo;
        }

        _detailsContainer = d3.select("body")
            .append("div")
            .classed("demos-controller-details-container", true);

        _titleContainer = _detailsContainer
                            .append("div")
                            .classed("demos-controller-title-container",true);

        _descriptionContainer = _detailsContainer
            .append("div")
            .classed("demos-controller-description-container",true);


        _svgContainer = d3.select("body")
            .append("svg")
            .classed("demos-controller",true)
            .attr("preserveAspectRatio", "xMidYMin meet" )
            ;

        setUpDropDownMenu();

    }();
}