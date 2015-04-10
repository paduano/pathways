var ZoomControl = function (container) {
    var self = {};

    self.onZoomIn = function () {

    };

    self.onZoomOut = function () {

    };

    var init = function () {
        var zoomContainer =
            container.append('div')
            .classed('zoom-control-container', true);

        zoomContainer.append('div')
            .classed('zoom-control-button', true)
            .classed('zoom-control-button-plus', true)
            .on('click', function () {
                self.onZoomIn()
            });


        zoomContainer.append('div')
            .classed('zoom-control-button', true)
            .classed('zoom-control-button-minus', true)
            .on('click', function () {
                self.onZoomOut()
            });

    }();

    return self;
};