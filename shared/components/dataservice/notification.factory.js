var factory = function($http, $q, User, RESOURCE_DOMAIN, Timer, logger, dataTransformer){
    const LIST_URL       = `${RESOURCE_DOMAIN}/private/notification/list`;
    const OPEN_URL       = `${RESOURCE_DOMAIN}/private/notification/open`;

    var intervalPromise,
        notifications = {},
        intervalDelay = 60 * 1000;

    var service = {
        isRunning: isRunning,
        startNotifications: startNotifications,
        stopNotifications: stopNotifications,
        getNotifications: getNotifications,
        openNotification: openNotification
    };

    return service;
    /////////////////////

    function isRunning() {
        return angular.isDefined(intervalPromise) && angular.isObject(intervalPromise) && intervalPromise.$$state.status === 0;
    }

    function startNotifications(interval, options = {}) {
        if ( isRunning() ) return;

        getNotifications(options).then((list)=>{
            displayMessages(list);

            intervalPromise = Timer.addInterval(()=>{
                getNotifications(options).then((list)=>{
                    displayMessages(list);
                });
            }, interval || intervalDelay);
        });
    }

    function displayMessages(list) {
        _.each(list, function (notification) {
            if (!notifications[notification.id]) {
                notifications[notification.id] = notification;

                switch (notification.type) {
                    case 'REWARD':
                        User.getUser();
                        displayMessage(notification);
                        break;
                    case 'PROFILE_LINK':
                        logger.redirectNotification('success', notification, 'app.settings');
                        break;
                    default:
                        displayMessage(notification);
                }

                openNotification(notification.id);
            }
        });
    }

    function displayMessage(notification) {
        if (notification.message) {
            logger.notification(notification);
        }
    }

    function stopNotifications() {
        if (isRunning()) {
            Timer.cancelInterval(intervalPromise);
            intervalPromise = undefined;
        }
    }

    function getNotifications(options = {}) {
        var deferred = $q.defer(),
            parameters = '',
            defaultParameters;

        defaultParameters = {
            unread: 1,
            read: 0
        };

        options = angular.extend({}, defaultParameters, options);

        parameters = '?_format=json';

        if (angular.isDefined(options.offset)) parameters += `&offset=${options.offset}`;
        if (angular.isDefined(options.limit)) parameters += `&limit=${options.limit}`;
        if (angular.isDefined(options.read)) parameters += `&read=${options.read}`;
        if (angular.isDefined(options.unread)) parameters += `&unread=${options.unread}`;
        if (angular.isDefined(options.type)) parameters += `&type=${options.type}`;

        $http.get(`${LIST_URL}${parameters}`)
            .success(function(data, status, headers, config){
                deferred.resolve(data.response.items);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function openNotification(notificationId) {
        var deferred = $q.defer();

        $http.get(`${OPEN_URL}/${notificationId}`)
            .success(function(data, status, headers, config){
                delete notifications[notificationId];

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }
};

export default factory;
