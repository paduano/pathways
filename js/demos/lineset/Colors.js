var Colors = {
    //pathways : ["","#fbb4ae","","#b3cde3","","#ccebc5","","#decbe4","","#fed9a6","","#ffffcc","","#e5d8bd"]
    //pathways : ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494"]
    pathways : ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628"],
    deselected: {
        complex: "#aea09c",
        protein: "#b8bdca",
        pathway :"#b8bdca"
    }
};

Colors.desaturate = function(c){
    return net.brehaut.Color(c).blend(net.brehaut.Color(Colors.deselected.pathway), 0.86).toCSS();
};