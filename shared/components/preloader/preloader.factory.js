var factory = function($rootScope) {
    var counterOfRequests = [];

    var service = {
        shouldHideOverlay: shouldHideOverlay,
        responseIsReceived: responseIsReceived,
        requestIsSent: requestIsSent,
        resetCounter: resetCounter
    };

    return service;
    /////////////////////

    function requestIsSent(name) {
        counterOfRequests[name] = angular.isNumber(counterOfRequests[name]) ? counterOfRequests[name] + 1 : 1;

        $rootScope.$broadcast('preloader:updated', { countOfRequests: counterOfRequests[name], name: name });
    }

    function responseIsReceived(name) {
        counterOfRequests[name] = angular.isNumber(counterOfRequests[name]) ? counterOfRequests[name] - 1 : 0;
        if(counterOfRequests[name] < 0)
            counterOfRequests[name] = 0;

        $rootScope.$broadcast('preloader:updated', { countOfRequests: counterOfRequests[name], name: name });
    }

    function shouldHideOverlay(name) {
        return counterOfRequests[name] === 0;
    }

    function resetCounter() {
        counterOfRequests = [];
    }
}

export default factory;
