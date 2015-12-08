var factory = function($http, $q, RESOURCE_DOMAIN, logger, dataTransformer){
    const LIST_URL            = `${RESOURCE_DOMAIN}/private/user/friend/list`;
    const APPROVE_URL         = `${RESOURCE_DOMAIN}/private/user/friend/user/approve`;
    const REJECT_URL          = `${RESOURCE_DOMAIN}/private/user/friend/user/decline`;
    const INVITE_URL          = `${RESOURCE_DOMAIN}/private/user/friend/request/send/out`;
    const INVITE_USERS_URL    = `${RESOURCE_DOMAIN}/private/user/friend/referral/send`;
    const ADD_URL             = `${RESOURCE_DOMAIN}/private/user/friend/request/send/user`;
    const ADD_USERS_URL       = `${RESOURCE_DOMAIN}/private/user/friend/request/send/users`;
    const CANCEL_URL          = `${RESOURCE_DOMAIN}/private/user/friend/user/remove`;
    const REMOVE_URL          = `${RESOURCE_DOMAIN}/private/user/friend/remove/user`;
    const REFERRAL_URL        = `${RESOURCE_DOMAIN}/private/user/friend/referral/send`;
    const IS_FRIEND_URL       = `${RESOURCE_DOMAIN}/private/user/friend/check`;

    var service = {
        findFriendById: findFriendById,
        getFriends: getFriends,
        getFriendsById: getFriendsById,
        approveByUser: approveByUser,
        rejectByUser: rejectByUser,
        addFriendByUser: addFriendByUser,
        addFriends: addFriends,
        cancelRequestByUser: cancelRequestByUser,
        inviteByEmail: inviteByEmail,
        inviteUsers: inviteUsers,
        inviteReferral: inviteReferral,
        unfriendUser: unfriendUser,
        isFriend: isFriend
    };

    return service;
    /////////////////////

    function findFriendById(userId, friends){
        return _.findWhere(friends, { id: userId });
    }

    function getFriends(approved = true, waiting = true){
        var deferred = $q.defer();

        $http.get(`${LIST_URL}?_format=json&approved=${approved}&waiting=${waiting}`)
            .success(function(data, status, headers, config){
                // logger.info('Friends were received');

                deferred.resolve(data.response.items);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getFriendsById(userId, approved = true, waiting = true){
        var deferred = $q.defer();

        $http.get(`${LIST_URL}/${userId}?_format=json&approved=${approved}&waiting=${waiting}`)
            .success(function(data, status, headers, config){
                // logger.info('Friends were received');

                deferred.resolve(data.response.items);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function approveByUser(userId) {
        var deferred = $q.defer();

        $http.post(`${APPROVE_URL}/${userId}`)
            .success(function(data, status, headers, config){
                logger.info(`Friend request from user #${userId} was approved`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function cancelRequestByUser(userId) {
        var deferred = $q.defer();

        $http.delete(`${CANCEL_URL}/${userId}`)
            .success(function(data, status, headers, config){
                logger.info(`Friend request from user #${userId} was removed`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function rejectByUser(userId) {
        var deferred = $q.defer();

        $http.post(`${REJECT_URL}/${userId}`)
            .success(function(data, status, headers, config){
                logger.info(`Friend request from user #${userId} was declined`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function addFriendByUser(userId) {
        var deferred = $q.defer();

        $http.post(`${ADD_URL}/${userId}`)
            .success(function(data, status, headers, config){
                logger.info(`Friend request was sent to the user #${userId}`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function addFriends(list) {
        var deferred = $q.defer();

        var data = {
              user: list
        };

        $http({
            method: 'POST',
            url: ADD_USERS_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        }).success(function (data, status, headers, config) {
            var length = list.length,
                wordInvitation = length > 1 ? 'invitations' : 'invitation';

            logger.success(`${length} friend ${wordInvitation} have been sent.`);

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function inviteByEmail(email) {
        var deferred = $q.defer();

        var data = {
            email: email
        };

        $http({
                method: 'POST',
                url: INVITE_URL,
                headers: {'Content-Type': 'multipart/form-data'},
                transformRequest: dataTransformer.transformData,
                data: data
            })
            .success(function(data, status, headers, config){
                logger.info(`Invitation was sent to ${email}.`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function inviteUsers(list, firstname = '', lastname = '') {
        var deferred = $q.defer();

        var data = {
            email: list,
            firstname: firstname,
            lastname: lastname
        };

        $http({
            method: 'POST',
            url: INVITE_USERS_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        }).success(function(data, status, headers, config){
            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function inviteReferral(email) {
        var deferred = $q.defer();

        var url = `${REFERRAL_URL}/${email}`;

        $http.post(url)
            .success(function(data, status, headers, config){
                logger.success(`Your invitation has been sent to ${email}.`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function unfriendUser(userId) {
        var deferred = $q.defer();

        $http.post(`${REMOVE_URL}/${userId}`)
            .success(function(data, status, headers, config){
                if (data.meta.message) logger.success(data.meta.message);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function isFriend(userId) {
        var deferred = $q.defer();

        $http.post(`${IS_FRIEND_URL}/${userId}`)
            .success(function(data, status, headers, config){

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }
}

export default factory;
