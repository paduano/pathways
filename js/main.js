$(document).ready(function() {

    var svg = d3.select("body")
                .append("svg")
                .attr("viewBox","-50 -80 100 100")
                .attr("width", "800px")
                .attr("height", "700px");

    var jsys = new JointsSystem();
    var rend = new TreeRender(svg ,jsys);

    setInterval(loop, 30);

    function loop( )
    {
        jsys.update(0.030);
        rend.drawSekeleton();
        rend.draw();
    }
});