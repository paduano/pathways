var Performance = {};

Performance.duration = function(func) {
    var start = new Date();
    func();
    var end = new Date();
    return end - start;
};