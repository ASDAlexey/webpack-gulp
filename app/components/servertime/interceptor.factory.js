var factory = function(Servertime, RESOURCE_DOMAIN){
    var isSent= false;

    var service = {
        'request': request,
        'response': response
    };

    return service;
    /////////////////////

    function request(config){
        var isApiUrl = !!(config.url.indexOf(RESOURCE_DOMAIN) + 1);

        if (isApiUrl && !isSent){
            isSent = true;
        }

        return config;
    }

    function response(response){
        var isApiUrl = !!(response.config.url.indexOf(RESOURCE_DOMAIN) + 1);

        if (isApiUrl && isSent && response.data.meta && response.data.meta.time){
            Servertime.initClock(parseInt(response.data.meta.time, 10) * 1000);
        }

        return response;
    }
}

export default factory;
