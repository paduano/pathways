var PathwaysSearchUtils = PathwaysSearchUtils || {};

PathwaysSearchUtils.searchPath = function (origin) {

    var deep = 0,
        MAX_DEEP = 5;

    var visibleDownstream = [],
        visibleUpstream = [];


    var checkedList = [];

    var openList = [origin];

    while(deep < MAX_DEEP){

        var nextOpenList = [];

        openList.forEach(function (open) {
            open.__checked = true;
            checkedList.push(open);
            open.nextComponents.forEach(function (next) {
               if(!next.__checked){
                   nextOpenList.push(next);
                   if(next._visible){
                       visibleDownstream.push(next);
                   }
               }
           });
        });

        openList = nextOpenList;

        deep++;
    }



    //reset checkedList
    checkedList.forEach(function (e) {
        e.__checked = undefined;
    });

    return [visibleDownstream, visibleUpstream];

};
