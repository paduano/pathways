function createDummyComplex(branching, nProt){
    var _mainComplex = {name:"main complex", type:"complex",components : []};

    var complexes = [_mainComplex];

    var lastRow = [_mainComplex];


    var rowCounter = 0;
    branching.forEach(function(b){

        var newLastRow = [];
        lastRow.forEach(function (c) {
            //d3.range(Math.floor(Math.random()*b)).forEach(function(i){
            d3.range(b).forEach(function(i){
                var newC = {name:"complex " + rowCounter + " " + i, components : [], type:"complex"};
                c.components.push(newC);
                newLastRow.push(newC);
            })

        });

        lastRow = newLastRow;
        complexes = _.union(complexes, lastRow);
        rowCounter++;
    });

    var proteinCounter = 0;
    lastRow.forEach(function (c) {
        proteinCounter++;
        for(var i = 0; i < nProt; i++){
            c.components.push({name:"protein" + proteinCounter, type:"protein"});
        }
    });

    //flattern complex elements
    complexes.forEach(function(complex){

        function getAllComponents(c){
            var components = [].concat(c.components.filter(function(e){return e.type == "protein"}));
            //do not explore already expanded pathways
            c.components.filter(function(e){return e.type == "complex"}).forEach(function(e){
                components = _.union(components, getAllComponents(e));
            });

            return components;
        }

        function getAllComplexes(c){
            var components = [].concat(c.components.filter(function(e){return e.type == "complex"}));
            //do not explore already expanded pathways
            c.components.filter(function(e){return e.type == "complex"}).forEach(function(e){
                components = _.union(components, getAllComplexes(e));
            });

            return components;
        }

        complex.allComplexes = getAllComplexes(complex);
        complex.allComponents = getAllComponents(complex);
    });

    return _mainComplex;
}