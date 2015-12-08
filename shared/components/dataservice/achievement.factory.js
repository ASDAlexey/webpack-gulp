var Factory = function($http, $q, RESOURCE_DOMAIN, logger, dataTransformer, $rootScope){
    const LIST_URL             = `${RESOURCE_DOMAIN}/achievement/user/get`;
    const USER_URL             = `${RESOURCE_DOMAIN}/private/user/achievements/get`;
    const GET_URL              = `${RESOURCE_DOMAIN}/achievement/get`;
    const LIKE_URL             = `${RESOURCE_DOMAIN}/private/achievement/like`;
    const REWARD_SHARE_FB      = `${RESOURCE_DOMAIN}/private/achievement/share/facebook`;
    const REWARD_SHARE_TW      = `${RESOURCE_DOMAIN}/private/achievement/share/twitter`;
    const GET_COMMENTS_URL     = `${RESOURCE_DOMAIN}/achievement/comment/get`;
    const SEND_COMMENT_URL     = `${RESOURCE_DOMAIN}/private/achievement/comment/send`;
    const FLAG_COMMENT_URL     = `${RESOURCE_DOMAIN}/private/achievement/comment/report`;

    var service = {
        getAchievementsByUserId: getAchievementsByUserId,
        getAchievementsById: getAchievementsById,
        like: like,
        rewardFb: rewardFb,
        rewardTw: rewardTw,
        getAchievementComments: getAchievementComments,
        sendComment: sendComment
    };

    var achievements = [];

    return service;
    /////////////////////

    function getAchievementsByUserId(userId){
        var deferred = $q.defer();

        $http.get(`${LIST_URL}/${userId}`)
            .success(function(data, status, headers, config){
                // achievements[`${userId}`] = data.response.items;
                logger.info('The achievements were received');

                deferred.resolve(data);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function findAchievementsByUserId(userId){
        return achievements[userId];
    }

    function getAchievementsById(achievementId){
        var deferred = $q.defer();

        $http.get(`${GET_URL}/${achievementId}`)
            .success(function(data, status, headers, config){
                logger.info(`The achievement #${data.response.id} was received`);

                deferred.resolve(data);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function like(achievementId){
        var deferred = $q.defer();

        $http.post(`${LIKE_URL}/${achievementId}`)
            .success(function(data, status, headers, config){
                $rootScope.$broadcast('jellyLikeAchievement', data);

                deferred.resolve(data);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function rewardFb(){
        var deferred = $q.defer();

        $http.post(`${REWARD_SHARE_FB}`)
            .success(function(data, status, headers, config){

                if(data.response.add_points != 0){
                    logger.success('You have been rewarded +50 points');
                }

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function rewardTw(){
        var deferred = $q.defer();

        $http.post(`${REWARD_SHARE_TW}`)
            .success(function(data, status, headers, config){

                if(data.response.add_points != 0){
                    logger.success('You have been rewarded +50 points');
                }

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getAchievementComments(achievementId){
        var deferred = $q.defer();

        $http.get(`${GET_COMMENTS_URL}/${achievementId}`)
            .success(function(data, status, headers, config){

                logger.info('The achievement comments were received');

                var clientTime = new Date().getTime();

                deferred.resolve({
                    list: data.response,
                    timeDifference: (parseInt(data.meta.time, 10) * 1000) - clientTime
                });
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function sendComment(comment){
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: SEND_COMMENT_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: comment
        }).success(function(data, status, headers, config){

            $rootScope.$broadcast('achievement:comment:send', data.response.achievement);

            logger.info(`Comment #${data.response.id} was received`);

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }
}

export default Factory;
