var factory = function($http, $q, RESOURCE_DOMAIN, logger, dataTransformer){
    const USER_MESSAGES_URL = `${RESOURCE_DOMAIN}/private/chat/get`;
    const CHATS_URL         = `${RESOURCE_DOMAIN}/private/chat/list`;
    const SEND_URL          = `${RESOURCE_DOMAIN}/private/chat/send`;
    const HISTORY_URL       = `${RESOURCE_DOMAIN}/private/chat/history/get`;

    var service = {
        getMessagesFromUser: getMessagesFromUser,
        getListChats: getListChats,
        sendMessageToUser: sendMessageToUser,
        getHistory: getHistory
    };

    return service;
    /////////////////////

    function getMessagesFromUser(user) {
        var deferred = $q.defer();

        $http.get(`${USER_MESSAGES_URL}/${user.id}`)
            .success(function(data, status, headers, config){
                var response = {
                    meta: {
                        'CHAT_DAILY_MESSAGE_REWARD': data.meta.CHAT_DAILY_MESSAGE_REWARD || 0,
                        'CHAT_DAILY_TOTAL_REWARD': data.meta.CHAT_DAILY_TOTAL_REWARD || 0,
                        'CHAT_DAILY_REWARDED_MESSAGES': data.meta.CHAT_DAILY_REWARDED_MESSAGES
                    },
                    messages: data.response.items.reverse()
                };

                deferred.resolve(response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getListChats() {
        var deferred = $q.defer();

        var clientTime = new Date().getTime(),
            timeDifference = 0;

        $http.get(CHATS_URL)
            .success(function(data, status, headers, config){
                // logger.info('The list of chats is received.');
                deferred.resolve({
                    list: data.response.items,
                    timeDifference: (parseInt(data.meta.time, 10) * 1000) - clientTime
                });
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function sendMessageToUser(user, message) {
        var deferred = $q.defer();

        var data = {
            message: message
        };

        $http({
                method: 'POST',
                url: `${SEND_URL}/${user.id}`,
                headers: {'Content-Type': 'multipart/form-data'},
                transformRequest: dataTransformer.transformData,
                data: data
            })
            .success(function(data, status, headers, config){
                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getHistory(user, limit = 10){
        var deferred = $q.defer();

        $http.get(`${HISTORY_URL}/${user.id}?_format=json&limit=${limit}`)
            .success(function(data, status, headers, config){
                var response = {
                    meta: {
                        'CHAT_DAILY_MESSAGE_REWARD': data.meta.CHAT_DAILY_MESSAGE_REWARD || 0,
                        'CHAT_DAILY_TOTAL_REWARD': data.meta.CHAT_DAILY_TOTAL_REWARD || 0,
                        'CHAT_DAILY_REWARDED_MESSAGES': data.meta.CHAT_DAILY_REWARDED_MESSAGES || []
                    },
                    messages: data.response.items.reverse()
                };

                deferred.resolve(response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }
}

export default factory;
