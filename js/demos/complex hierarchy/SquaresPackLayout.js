function SquarePackLayouts (size, childrenFunction) {
    var self = {};
    var margin = 4;
    var padding = 1;

    var children = function (parent) {
        if(parent._squarePackDummy){
            return parent.children;
        }else{
            return childrenFunction(parent)
        }
    };

    var forEachChildren = function(parent, func) {
        children(parent).forEach(function(e){func(e)});
    };

    var translateElement = function(element, x,y){
        element.x += x;
        element.y += y;
        forEachChildren(element, function(c){translateElement(c,x,y)});
    };

    var getBoundingBox = function(elements){

        if(elements.length > 0){
            var minX = _.min(elements, function(e){return e.x}).x;
            var minY = _.min(elements, function(e){return e.x}).y;
            var maxXelement = _.max(elements, function(e){return e.x + e.dx});
            var maxYelement = _.max(elements, function(e){return e.y + e.dy});
            var maxWidth = maxXelement.x + maxXelement.dx;
            var maxHeight = maxYelement.y + maxYelement.dy;
            return [minX, minY, maxWidth, maxHeight];
        } else {
            return [0,0,size,size];
        }

    };

    var packElements = function(elements){

        elements = _.sortBy(elements, function (e) {return e.dx}).reverse();

        var singleElements = elements.filter(function (e) {return children(e).length == 0});
        if(singleElements.length > 1){
            elements = _.difference(elements, singleElements);
            elements.push(gridPack(singleElements));
        }

        var x = margin;
        var y = margin;
        elements.forEach(function (element) {
            translateElement(element,x,y);
            if(x + element.dx <= y + element.dy){
                x += element.dx + padding;
            } else {
                y += element.dy + padding;
            }

        })
    };


    var gridPack = function(elements){
        var maxDx = _.max(elements, function(e){return e.dx}).dx;
        var maxDy = _.max(elements, function(e){return e.dy}).dy;

        var columns = Math.ceil(Math.sqrt(elements.length));
        var x = 0;
        var y = 0;

        for(var i = 0; i < elements.length; i++){
            var element = elements[i];
            if(i != 0 && i % columns == 0){
                x = 0;
                y += maxDy + padding;
            }
            translateElement(element,x,y);
            x += element.dx + padding;
        }

        return {x: 0, y:0, dx: x, dy: y + maxDy, children: elements, _squarePackDummy : true}
    };


    var recursivePacking = function(root, depth){

        forEachChildren(root, function(child){
            child.parent = root;
            recursivePacking(child, depth + 1);
        });

        var elements = children(root);
        packElements(elements);
        var bbox = getBoundingBox(elements);
        root.x  = 0;
        root.y  = 0;
        root.dx = bbox[2]//Math.max(bbox[2],bbox[3]);
        root.dy = bbox[3]//Math.max(bbox[2],bbox[3]);
        if(elements.length != 0){
            root.dx += margin;
            root.dy += margin;
        }


        root.depth = depth;

    };

    self.nodes = function(root){
        var list = [root];

        forEachChildren(root, function(child){
            list = list.concat(self.nodes(child));
        });
        return list;
    };

    self.pack = function(root){
        recursivePacking(root,0);
        root.dx = Math.max(root.dx,root.dy);
        root.dy = root.dx;

    };


    return self;
}
