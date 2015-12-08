var factory = function($q){
    var serverTime = 0,
        deferred = $q.defer(),
        interval;

    var service = {
        'getServerTime': getServerTime,
        'initClock': initClock
    };

    return service;
    /////////////////////

    function getServerTime(){
        if (!serverTime){
            return deferred.promise;
        } else {
            var newDeferred = $q.defer();

            newDeferred.resolve(serverTime);

            return newDeferred.promise;
        }
    }

    function initClock(time){
        if (!serverTime){
            serverTime = time;

            deferred.resolve(serverTime);

            if (interval) clearInterval(interval);

            interval = setInterval(()=>{
                serverTime = serverTime + 1000;
            }, 1000);
        }
    }
}

export default factory;
