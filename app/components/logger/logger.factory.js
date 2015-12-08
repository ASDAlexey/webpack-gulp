var logger = function($log, $injector, toaster){
    var service = {
        error   : error,
        info    : info,
        success : success,
        warning : warning,
        notification: notification,
        redirectNotification: redirectNotification,

        // straight to console; bypass toastr
        log     : $log.log
    };

    return service;
    /////////////////////

    function error(consoleMessage, toasterMessage, title = '', flag = true){
        if (flag) toaster.pop('error', title, toasterMessage || consoleMessage);
        $log.error(`Error: ${consoleMessage}`);
    }

    function success(consoleMessage, toasterMessage, title = '', flag = true){
        if (flag) toaster.pop('success', title, toasterMessage || consoleMessage);
        $log.info(`Success: ${consoleMessage}`);
    }

    function info(consoleMessage, toasterMessage, title = '', flag = true){
        if (__DEV__) {
            toaster.pop('info', title, toasterMessage || consoleMessage);
            $log.info(`Info: ${consoleMessage}`);
        }
    }

    function warning(consoleMessage, toasterMessage, title = '', flag = true){
        if (flag) toaster.pop('warning', title, toasterMessage || consoleMessage);
        $log.warn(`Warning: ${consoleMessage}`);
    }

    function notification(item) {
        var settings = {
            'type': 'success',
            'body': item.message
        };
        toaster.pop(settings);
        $log.info(`Notification: ${item.message}`);
    }

    function redirectNotification(type, item, url) {
        var settings = {
            'type': type,
            'body': item.message,
            clickHandler: function(toast){

                toast.uid = toast.id;
                toaster.clear(undefined, toast.id);

                $injector.get('$state').go(url);
            }
        };

        toaster.pop(settings);
        $log.info(`Notification: ${item.message}`);
    }
};

export default logger;
