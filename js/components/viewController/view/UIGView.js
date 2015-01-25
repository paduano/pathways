/**
 *  Class UIGView
 *  Base class for the <g> element
 */
var UIGView = function(g) {
    var self = null;

    if(g){
       self = UIView(g);
    } else {
       self = UIView(d3.select(document.createElementNS('http://www.w3.org/2000/svg', 'g')));
    }


    /** PUBLIC FUNCTIONS**/


    /**
     * Set the translation
     * @param x
     * @param y
     */
    self.setTranslation = function(x, y) {
        self.attr("transform", "translate(" + [x, y] + ")");
        return self;
    };

    self.setScale = function(x, y) {
        self.attr("transform", "translate(" + [self.x, self.y] + ")scale(" + [x, y] + ")");
    };

    self.__defineGetter__("x", function(){
        var x =  d3.transform(self.attr("transform")).translate[0];
        return x ? parseFloat(x) : 0;
    });

    self.__defineGetter__("y", function(){
        var y = d3.transform(self.attr("transform")).translate[1];
        return y ? parseFloat(y) : 0;
    });

    self.__defineSetter__("pos", function(pos){
        self.setTranslation(pos.x, pos.y);
    });

    self.__defineGetter__("pos", function(){
        return vec2(self.x, self.y);
    });

    self.__defineSetter__("scale", function(scale){
       self.attr("transform", "translate(" + [self.x, self.y] + ")scale(" + scale + ")");
    });



    /** PRIVATE FUNCTIONS**/



    var init = function() {


    }();

    return self;
};