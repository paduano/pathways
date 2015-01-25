/**
 *  Class UIImageView
 *  @param imageElement is optional
 */
var UIImageView = function(imageElement) {

    var self = null;
    if(imageElement){
        self = UIView(imageElement);
    } else {
        self = UIView(d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'image')));
    }



    /** PUBLIC FUNCTIONS**/

    self.__defineSetter__("imageSrc", function(imageSrc) {
        self.attr("xlink:href", imageSrc);
    });

    self.__defineGetter__("imageSrc", function(imageSrc) {
        return self.attr("xlink:href");
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


    /** PRIVATE FUNCTIONS**/


    var init = function() {

        self.classed("ui-image-view", true);
        if(!self.attr("width")){
            self.width = "100%";
        }
        if(!self.attr("height")){
            self.height = "100%";
        }

    }();

    return self;
};