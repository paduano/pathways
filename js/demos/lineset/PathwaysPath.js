function PathwaysPath(pathways){
    var self = {};
    var _pathways = pathways;

    var shiftInNode = function(pathway, node){
        var width = 10;
        var selectedPathways = node.pathways.filter(function(p){return p._selected;});
        var index = selectedPathways.indexOf(pathway);

        if(index == -1){
            return 0;
        }
            

        return ((index+1) - Math.ceil(selectedPathways.length/2))*width;
    };


    self.computePositions = function(pathway){
        var position = [];

        for(var i = 0; i < pathway.allComponents.length; i++){
            var currentNode = pathway.allComponents[i];
            var adiacentNode1, adiacentNode2;

            if(i == pathway.allComponents.length-1){
                adiacentNode1 = pathway.allComponents[i-1];
                adiacentNode2 = currentNode;
            } else if(i == 0) {
                adiacentNode1 = currentNode;
                adiacentNode2 = pathway.allComponents[i+1];
            } else {
                adiacentNode1 = pathway.allComponents[i-1];
                adiacentNode2 = pathway.allComponents[i+1];
            }

            var p1 = vec2(adiacentNode1);
            var p2 = vec2(adiacentNode2);
            var diff = p2.subV(p1);
            var perpendicular = diff.perpendicular().normalize();
            var invPerpendicular = perpendicular.invert();
            //take always the one with greater y (and then x)
            if(perpendicular.y < invPerpendicular.y){
                perpendicular = invPerpendicular
            } else if(perpendicular.y == invPerpendicular.y && perpendicular.x < invPerpendicular.x) {
                perpendicular = invPerpendicular;
            }


            var shift = perpendicular.mulS(shiftInNode(pathway, currentNode));



            position.push({x: currentNode.x + shift.x, y: currentNode.y + shift.y});
        }


        return position;
    };

    var init = function () {

    }();


    return self;
};