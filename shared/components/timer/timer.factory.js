var factory = function($interval, $rootScope) {
    var timers = [];

    var service = {
        addInterval: addInterval,
        cancelInterval: cancelInterval,
        cancelAllIntervals: cancelAllIntervals
    };

    return service;
    /////////////////////

    function addInterval(callback, delay) {
        var promise;

        if (angular.isFunction(callback) && angular.isNumber(delay)) {
            promise = $interval(callback, delay);
            timers.push(promise);
        } else {
            promise = false;
        }

        return promise;
    }

    function cancelInterval(promise) {
        var indexPromise = timers.indexOf(promise);

        timers.splice(indexPromise, 1);

        return $interval.cancel(promise);
    }

    function cancelAllIntervals() {
        timers.forEach(function (value, index) {
            $interval.cancel(value);
        });

        timers = [];
    }
}

export default factory;
