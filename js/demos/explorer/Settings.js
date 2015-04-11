var Settings = function (container) {
    var self = {};

    var opened = false;
    var settings, animContainer;

    self.onChangeColor = null;

    self.onChangeCurvedLinks = null;

    var paletteDiv;

    var colorPalettes = [
        {name: "5 Colors", colors: ["#e41a1c","#377eb8", "#4daf4a", "#984ea3", "#ff7f00"]},
        {name: "10 Colors", colors: ["#BE5DD2", "#55B752", "#C55E32", "#52A0A4", "#74628A", "#4C733B", "#BB4F5D", "#C85298", "#97A638", "#7B85D4"]},
        {name: "3 Colors (colorblind)", colors: ["#66c2a5","#fc8d62","#8da0cb"]}
    ];

    self.colors = colorPalettes[0];
    self.curvedLinks = false;

    var changeColorPalette = function(palette) {
        self.colors = palette.colors;

        paletteDiv.html('');

        paletteDiv.selectAll('div').data(palette.colors).enter()
            .append('div')
            .style('background-color', function(d){return d} );

        settings.selectAll('.demo-explorer-palette-button')
            .classed('demo-explorer-settings-button-selected', function (d) {return d == palette;})
            .classed('demo-explorer-settings-button-deselected', function (d) {return d != palette;});

        if(self.onChangeColor)
            self.onChangeColor();
    };

    var setUpColors = function () {

        var div = animContainer.append('div').classed('demo-explorer-settings-area',true);

        div.append('h3')
            .classed('demo-explorer-settings-section',true)
            .text('Colors');

        paletteDiv = div.append('div')
            .classed('demo-explorer-palette', true);

        div.selectAll('.demo-explorer-palette-button').data(colorPalettes).enter()
            .append('div')
            .classed('demo-explorer-palette-button', true)
            .text(function (d) {return d.name})
            .on('click', function (d) {
                changeColorPalette(d);
            });

        div.append('div').style('clear', 'both');

    };

    var setUpCurvedLinks = function () {
        var div = animContainer.append('div').classed('demo-explorer-settings-area',true);
        div.append('h3')
            .classed('demo-explorer-settings-section',true)
            .text('Curved Links');

        div.selectAll('.demo-explorer-curved-links-button').data([true,false]).enter()
            .append('div')
            .classed('demo-explorer-curved-links-button', true)
            .classed('demo-explorer-settings-button-selected', function (d) {return d == self.curvedLinks})
            .classed('demo-explorer-settings-button-deselected', function (d) {return d != self.curvedLinks})
            .text(function (d) {
                return d? "ON" : "OFF";
            })
            .on('click', function (d) {
                if(self.curvedLinks != d){
                    self.curvedLinks = d;
                    if(self.onChangeCurvedLinks)
                        self.onChangeCurvedLinks();
                }

                div.selectAll('.demo-explorer-curved-links-button')
                    .classed('demo-explorer-settings-button-selected', function (d) {return d == self.curvedLinks})
            });


        div.append('div').style('clear', 'both');
    };

    var init = function () {
        settings = container.append('div')
            .classed('demo-explorer-settings', true);
        settings.style('pointer-events', 'visiblePainted');

        animContainer = settings.append('div')
            .classed('demo-explorer-settings-container', true)
            .style('bottom','0px');


        setUpColors();
        changeColorPalette(colorPalettes[0]);

        setUpCurvedLinks();

        var openClose = animContainer.append('div')
            .classed('demo-explorer-settings-button', true)
            .classed('demo-explorer-settings-button-open', opened)
            .classed('demo-explorer-settings-button-close', !opened)
            .on('click',function () {
                opened = !opened;

                d3.select(this)
                    .classed('demo-explorer-settings-button-open', opened)
                    .classed('demo-explorer-settings-button-close', !opened);

                if(opened){
                    animContainer.transition()
                        .style('margin-left','0px')
                        .style('bottom','0px');
                    settings.style('pointer-events', 'visiblePainted');
                }else {
                    animContainer.transition()
                        .style('margin-left','230px')
                        .style('bottom',animContainer.node().getBoundingClientRect().height - 10 + 'px');
                    settings.style('pointer-events', 'none');

                }
            });

        //close?
        if(!opened){
            animContainer
                .style('margin-left','230px')
                .style('bottom',animContainer.node().getBoundingClientRect().height - 10 + 'px');
            settings.style('pointer-events', 'none');
        }


    }();

    return self;
};