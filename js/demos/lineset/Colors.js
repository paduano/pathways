var Colors = {
    //pathways : ["","#fbb4ae","","#b3cde3","","#ccebc5","","#decbe4","","#fed9a6","","#ffffcc","","#e5d8bd"]
    //pathways : ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494"]
    //pathways : ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628"],
    pathways : ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f","#e41a1c"],

    deselected: {
        complex: "#aea09c",
        protein: "#b8bdca",
        pathway :"#b8bdca"
    },

    selected: {
        protein: "#fd8d3c"
    },

    qualitativeSequence: ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6"],
    sequentialSequence: ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"],

    overedElement : ["#aea09c"]

};

Colors.desaturate = function(c){
    return net.brehaut.Color(c).blend(net.brehaut.Color(Colors.deselected.pathway), 0.86).toCSS();
};