var factory = function($http, $q, logger){

    const WEATHER_API = 'http://api.openweathermap.org/data/2.5/forecast/daily?cnt=7&id=';
    const PROXY_WEATHER_API = 'https://weather.jellychip.com/data/2.5/forecast/daily?cnt=7&id=';

    var service = {
        getDailyWeatherForecast: getDailyWeatherForecast
    };

    return service;
    /////////////////////

    function getDailyWeatherForecast(location) {
        var deferred = $q.defer();

        $http.get(`${PROXY_WEATHER_API}${location.id}`, {withCredentials: false})
            .success(function(data, status, headers, config){
                logger.info(`Forecast was received.`);

                deferred.resolve(data);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }
}

export default factory;
