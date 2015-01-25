/**
 *  Class UIBackgroundView
 *  Base class for the <div> element
 */
var UIBackgroundView = function() {

    var self = UIGView();



    /** PUBLIC FUNCTIONS**/



    /** PRIVATE FUNCTIONS**/



    var init = function() {

        self.classed("ui-background-view", true);

        self.append("rect")
            .attr("width","100%")
            .attr("height","100%");

    }();

    return self;
};