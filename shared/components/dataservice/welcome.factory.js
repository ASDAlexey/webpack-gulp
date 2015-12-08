var factory = function($http, $q, RESOURCE_DOMAIN, logger){
    const UPDATE_SHOW_URL = `${RESOURCE_DOMAIN}/private/user/welcometour/show`;
    const PASS_URL        = `${RESOURCE_DOMAIN}/private/user/welcometour/pass`;

    var service = {
        updateShowValue: updateShowValue,
        endWelcomeTour: endWelcomeTour
    };

    return service;
    /////////////////////

    function updateShowValue(newValue) {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: `${UPDATE_SHOW_URL}/${newValue}`
        }).success(function(data, status, headers, config){
            logger.info('The welcome tour was updated');

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function endWelcomeTour() {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: PASS_URL
        }).success(function(data, status, headers, config){
            logger.info('The welcome tour was updated');

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }
}

export default factory;
