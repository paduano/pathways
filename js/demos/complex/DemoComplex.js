/**
 * DEMO trees around a node, connected to other nodes
 */
function DemoComplex (containerSvg) {
    var self = this;

    self.complexes = []

    var jsys1;


    var _running = false;
    var _loopInterval;

    var svg = containerSvg;

    this.start = function() {
        drawLoop();
    };

    this.stop = function() {
        if(_running){
            _running = false;
            clearInterval(_loopInterval);
        }
    };


    //### helpers
    var closenessBetweenComplexes = function(c1, c2) {
        var intersection = c1.elements.filter(function(n) {
            return c2.elements.indexOf(n) != -1
        });
        return intersection.length;
    };


    //### Set up functions

    var setUp = function() {

        svg.attr("viewBox","-70 -100 120 120");

        var closeness = [];

        for(var c1 in self.complexes){
            for(var c2 in self.complexes){
                if(c1 < c2){
                    var complex1 = self.complexes[c1];
                    var complex2 = self.complexes[c2];

                    var c = closenessBetweenComplexes(complex1, complex2);
                    if(c > 0){
                        closeness.push({complex1:complex1, complex2:complex2, closeness:c});
                    }

                }
            }
        }

        self.closeness = _.sortBy(closeness, function(o){return o.closeness}).reverse();

    };

    var loadAssets = function(callback) {
        d3.json("resources/demos/complex/out.json",function(error, json){
            if (error) return console.warn(error);
            self.complexes = json;
            callback(null,null);
        });
    };

    var drawLoop = function() {
        //LOOP

        _loopInterval = setInterval(loop, 10);

        function loop( )
        {

        }
    };

    var init = function() {
        queue()
            //LOAD assets
            .defer(loadAssets)

            .await(function(){
                setUp();
            });

    } ();
}

//PARAMS
DemoComplex.demoTitle = "Complexes Demo";
DemoComplex.demoDescription = "This demo shows.. bla bla something about proteins " ;