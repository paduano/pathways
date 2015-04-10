var Legenda = function (container) {
    var self = {};

    var opened = true;

    var init = function () {
        var legenda = container.append('div')
            .classed('demo-explorer-legenda', true)
            .style('pointer-events', 'visiblePainted');


        var animContainer = legenda.append('div')
            .classed('demo-explorer-legenda-container', true);


        var openClose = animContainer.append('div')
            .classed('demo-explorer-legenda-button', true)
            .classed('demo-explorer-legenda-button-open', opened)
            .classed('demo-explorer-legenda-button-close', !opened)
            .on('click',function () {
                opened = !opened;

                d3.select(this)
                    .classed('demo-explorer-legenda-button-open', opened)
                    .classed('demo-explorer-legenda-button-close', !opened)

                if(opened){
                    animContainer.transition()
                        .style('margin-left','0px')
                        .style('margin-top','0px');
                    legenda.style('pointer-events', 'visiblePainted');
                }else {
                    animContainer.transition()
                        .style('margin-left','250px')
                        .style('margin-top','200px');
                    legenda.style('pointer-events', 'none');

                }
            });

        animContainer.append('div')
            .classed('demo-explorer-legenda-image', true);


    }();
};