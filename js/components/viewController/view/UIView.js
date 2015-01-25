/**
 *  Class UIView
 */
var UIView = function(domElement) {
    var self = domElement;

    self.parentController = null;

    /** PUBLIC FUNCTIONS**/

    /**
     * Add a subview to the currentView
     * @param subview (UIView)
     *
     * Try to avoid this function, and use only appendTo
     * If you find this function useful, ask Francesco
     */
    /*self.add = function(subview) {
        self.node().appendChild(subview.node());
    };*/

    /**
     * @Override
     * Add a controller or a view to the hierarchy
     */
    self.super_append = self.append;
    self.append = function(element) {
        if(element.view) {
            //appending a controller
            self.node().appendChild(element.view.node());
            if(self.parentController) {
                self.parentController.addChildController(element)
            } else {
                console.warn("Trying to add a controller to a view without controller");
            }
        } else if(element.node){
            //appending a normal view
            self.node().appendChild(element.node());
            element.parentController = self.parentController;
            //super_append(element);
        } else {
            //it is just a string
            return self.super_append(element);
        }

    };

    self.__defineSetter__("clickable", function(v) {
        self.classed("clickable-item", v);
    });

    /**
     * Append the current view to the given d3Element (parent view)
     * @param d3Element
     */
    self.appendTo = function(d3Element) {
        $(d3Element.node()).append(function(){return self.node()});
        return self;

    };


    self.__defineSetter__("id", function(a){
        self.attr("id", a);
    });

    self.__defineGetter__("id", function(){
        return self.attr("id");
    });

    /**
     *
     */
    self.hide = function() {
        self.style("opacity", 0);
    };

    /**
     *
     */
    self.show = function() {
        self.style("opacity", 1);
    };



    /** PRIVATE FUNCTIONS**/



    var init = function() {


    }();

    return self;
};