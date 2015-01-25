/**
 *  Class UISVGView
 *  @param svg is optional
 */
var UISvgView = function(svg) {

    var self = null;
    if(svg){
        self = UIView(svg);
    } else {
        self = UIView(d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'svg')));
    }



    /** PUBLIC FUNCTIONS**/


    //VIEWBOX GETTER AND SETTER

    /**
     * Returns viewBox x position
     * @returns {number}
     */
    self.__defineGetter__("viewBoxX", function() {
        var viewBox = self.attr("viewBox");
        return viewBox != null ? viewBox.split(/\s+|,/)[0] : null;
    });

    /**
     * Returns viewBox y position
     * @returns {number}
     */
    self.__defineGetter__("viewBoxY", function() {
        var viewBox = self.attr("viewBox");
        return viewBox != null ? viewBox.split(/\s+|,/)[1] : null;
    });

    /**
     * Return viewBox height
     * @returns {number}
     */
    self.__defineGetter__("viewBoxHeight", function() {
        var viewBox = self.attr("viewBox");
        return viewBox != null ? viewBox.split(/\s+|,/)[3] : null;
    });

    /**
     * Return viewBox width
     * @returns {number}
     */
    self.__defineGetter__("viewBoxWidth", function() {
        var viewBox = self.attr("viewBox");
        return viewBox != null ? viewBox.split(/\s+|,/)[2] : null;
    });


    /**
     * Set the view viewBox
     * @param x
     * @param y
     * @param width
     * @param height
     */
    self.setViewBox = function(x, y, width, height) {
        self.attr("viewBox", x + " " + y + " " + width + " " + height);
        return self;
    };


    //FRAME GETTER AND SETTERS


    /**
     * Set the view position and size in parent coordinates
     * @param x
     * @param y
     * @param width
     * @param height
     */
    self.setFrame = function(x, y, width, height) {
        self.attr("x", x);
        self.attr("y", y);
        self.attr("width", width);
        self.attr("height", height);
        return self;
    };


    /**
     * Return a frame object
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    self.getFrame = function() {
        return {
            x: self.getFrameX(),
            y: self.getFrameY(),
            width: self.getFrameWidth(),
            height: self.getFrameHeight()
        };
    };


    /**
     *
     * @param x
     * @param y
     */
    self.setFramePosition = function(x, y) {
        self.attr("x", x);
        self.attr("y", y);
    };


    self.__defineSetter__("x", function(x){
        self.attr("x", x);
    });


    self.__defineGetter__("x", function(){
        var x = self.attr("x");
        x = x != null ? x : 0;
        return x;
    });


    self.__defineSetter__("y", function(y){
        self.attr("y", y);
    });


    self.__defineGetter__("y", function(){
        var y = self.attr("y");
        y = y != null ? y : 0;
        return y;
    });

    /**
     * width height
     */
    self.__defineSetter__("width", function(width){
        self.attr("width", width);
    });


    self.__defineGetter__("width", function(){
        var width = self.attr("width");
        width = width != null ? width : 0;
        return width;
    });


    self.__defineSetter__("height", function(height){
        self.attr("height", height);
    });


    self.__defineGetter__("height", function(){
        var height = self.attr("height");
        height = height != null ? height : 0;
        return height;
    });


    //OTHER HELPERS FUNCTIONS

    /**
     *
     */
    self.bringToFront = function() {
        self.each(function(){
            this.parentNode.appendChild(this);
        });
    };



    /**
     * Set the preserveAspectRatio attribute of the svg
     * @param options {String}
     */
    self.setAspectRatioOptions = function(options) {
        self.attr("preserveAspectRatio", options);
        return self;
    };


    // Event handling
    /**
     * Shorthand to set a call back function to the view click event
     * @param callBack
     */
    self.onClick = function(callBack) {
        self.classed("ui-view-pointer", true);   // Add the class pointer if it is clickable
        self.on("click", callBack);
    };

    /**
     * Shorthand to set a call back function to the view click event
     * @param callBack
     */
    self.onDrag =function(callbackDragStart, callbackDrag, callbackDragEnd) {
        dragListener = d3.behavior.drag()
            .on("dragstart", callbackDragStart)
            .on("drag", callbackDrag)
            .on("dragend", callbackDragEnd);
        self.call(dragListener);
    };

    /** PRIVATE FUNCTIONS**/


    var init = function() {

        self.classed("ui-view", true);

        self
            .attr("x", 0)
            .attr("y", 0);
        /*
            .attr("width", 1)
            .attr("height", 1);
*/
        // Adding background

        /*
         self.style("pointer-events", "none");
         _eventsLayer = self.append("rect")
            .classed("background", true)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", "100%")
            .attr("height", "100%");*/

        self.setAspectRatioOptions("xMinYMin meet");

    }();

    return self;
};