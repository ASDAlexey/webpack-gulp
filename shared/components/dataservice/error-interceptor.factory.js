var factory = function($q, $log, $injector, logger, Timer){

    var service = {
        response: response,
        responseError: responseError
    };

    return service;
    /////////////////////

    function response(response) {
        if (response.data.meta && response.data.meta.errors.length){
            var httpError = response.data.meta.HTTP_ERR ? response.data.meta.HTTP_ERR : undefined;

            switch (httpError) {
                case 403:
                    handlerOf403();
                    break;
                default:
                    handlerOfErrors(response.data.meta.errors);
                }

            return $q.reject(response);
        }

        return response;
    }

    function responseError(rejection) {
        var message = `Request failed\nURL: ${rejection.config.url}\nStatus: ${rejection.status} ${rejection.statusText}\nData: ${rejection.data}`;
        $log.error(message);

        return $q.reject(rejection);
    }

    function handlerOfErrors(errors) {
        var consoleMessage = '',
            toasterMessage = '',
            maxCountOfMessages = 3,
            countOfMessages = 0;

        angular.forEach(errors, function(value, key) {
            consoleMessage += `Message: ${value.message}\n`;
            if (countOfMessages < maxCountOfMessages) toasterMessage += `<strong>Message</strong>: ${value.message}<br>`;

            if (value.property_path) {
                consoleMessage += `Property path: ${value.property_path}\n`;
                if (countOfMessages < maxCountOfMessages) toasterMessage += `<strong>Property path</strong>: ${value.property_path}<br>`;
            }

            if (errors.length > 1 && countOfMessages < maxCountOfMessages) toasterMessage += '<hr>';

            countOfMessages++;
        });

        if (countOfMessages >= maxCountOfMessages) toasterMessage += '...';

        logger.error(consoleMessage, toasterMessage, '');
    }

    function handlerOf403() {
        // injected manually to get around circular dependency problem
        var Auth = $injector.get('Auth');

        Timer.cancelAllIntervals();
        // if user is logged then reload current state to re-install all controllers
        Auth.showLoginPopup(false).result.then(()=>{
            var $state = $injector.get('$state');
            $state.reload();
        });
    }
}

export default factory;
