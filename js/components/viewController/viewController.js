/**
 *  Class ViewController
 */
var ViewController = function() {
    var self = {};

    var _view = null;
    self.children = [];

    /** PUBLIC FUNCTIONS**/

    self.addChildController = function(childController) {
        self.children.push(childController);
    };

    self.removeChildController = function(childController) {
        self.children = _.without(self.children, childController);
        childController.dispose();
    };


    /**
     * Remove the view from the dom
     * Call dispose on every child
     */
    self.dispose = function() {
        self.children.forEach(function(child) {
            child.dispose();
        });

        self.view.remove();

    };

    /**
     * Called every time it is necessary to update the view layout
     */
    self.updateView = function() {
        self.children.forEach(function(child) {
            child.updateView();
        });
    };


    //#GETTER AND SETTER
    self.__defineSetter__("view", function(view){
        _view = view;
        _view.parentController = self;
    });

    self.__defineGetter__("view", function(){
        return _view;
    });

    /** PRIVATE FUNCTIONS**/


    var init = function() {


    }();

    return self;
};


/**
 *  Create a view controller with an SVG view
 */
var SvgViewController = function() {
    var viewController = ViewController();
    viewController.view = UISvgView();
    return viewController;
};

/**
 *  Create a view controller with an G view
 */
var GViewController = function() {
    var viewController = ViewController();
    viewController.view = UIGView();
    return viewController;
};

/**
 *  Create a view controller with an DIV view
 */
var DivViewController = function() {
    var viewController = ViewController();
    viewController.view = UIDivView();
    return viewController;
};