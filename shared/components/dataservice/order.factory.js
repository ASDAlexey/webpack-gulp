var Order = function($http, $q, $rootScope, RESOURCE_DOMAIN, CATEGORIES_OF_SURVEYS, Question, LogicOfQuestions, logger, dataTransformer){
    const LIST_URL      = `${RESOURCE_DOMAIN}/adm/store/order/list`;

    var orders = {};
    var filterSettings = {};
    var sortSettings = {};
    var descSettings = {};

    var service = {
        getOrders: getOrders,
        getFilterSettings: getFilterSettings,
        getSortSettings: getSortSettings,
        setDescendingSortSettings: setDescendingSortSettings,
        getDescendingSortSettings: getDescendingSortSettings
    };

    return service;
    /////////////////////

    function getFilterSettings(){
        return filterSettings;
    }

    function getSortSettings(){
        return sortSettings;
    }

    function setDescendingSortSettings(settings){
        descSettings = settings;
    }

    function getDescendingSortSettings(){
        return descSettings;
    }

    function getOrders(filter, sort){

        filterSettings = filter;
        sortSettings = sort;

        var deferred = $q.defer();

        var queryString = filter ? `?offset=${filter.offset}&limit=${filter.limit}&filter=${JSON.stringify(filter)}&sort=${JSON.stringify(sort)}` : '';

        $http.get(`${LIST_URL}${queryString}`)
            .success(function(data, status, headers, config){
                logger.info(`Orders was received`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }
};

export default Order;
