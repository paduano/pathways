/**
 * DEMO trees around a node, connected to other nodes
 */
function DemoComplex (containerSvg) {
    var self = this;

    self.layout = null;
    self.complexes = [];

    var jsys1;


    var _running = false;
    var _loopInterval;

    var svg = UISvgView(containerSvg);

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


    //### Set up functions

    var setUp = function() {

        //svg.attr("viewBox","0 0 300 200");
        svg.setAspectRatioOptions("xMinYMin meet");
        svg.setFrame(0,0,"100%","100%");

        self.layout = ComplexesPlanarLayout(self.complexes, 200, 200);
        self.layout.view.setAspectRatioOptions("xMidYMid meet");
        self.layout.view.attr("viewBox","0 0 300 200");
        self.layout.view.setFrame("10%",0,"100%","100%");
        svg.append(self.layout);
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
DemoComplex.theme = "light-theme";