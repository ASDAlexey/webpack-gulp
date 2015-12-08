var User = function($http, $q, $rootScope, RESOURCE_DOMAIN, logger, dataTransformer, ROLES){
    const GET_URL             = `${RESOURCE_DOMAIN}/private/user/get`;
    const UPDATE_URL          = `${RESOURCE_DOMAIN}/private/user/update`;
    const PROFILE_URL         = `${RESOURCE_DOMAIN}/public/user/profile`;
    const LOGIN_URL           = `${RESOURCE_DOMAIN}/auth/login`;
    const LOGOUT_URL          = `${RESOURCE_DOMAIN}/auth/logout`;
    const REGISTER_URL        = `${RESOURCE_DOMAIN}/auth/register`;
    const RECOVERY_URL        = `${RESOURCE_DOMAIN}/auth/password/forgot`;
    const PASSWORD_URL        = `${RESOURCE_DOMAIN}/private/user/password/change`;
    const AVATAR_URL          = `${RESOURCE_DOMAIN}/private/user/avatar/change`;
    const FILTER_URL          = `${RESOURCE_DOMAIN}/dev/user/list/filter`;
    const GET_ADM_URL         = `${RESOURCE_DOMAIN}/dev/user/get`;
    const GET_FRIENDS_ADM     = `${RESOURCE_DOMAIN}/adm/user/friend/list`;
    const LOGIN_AS_USER_URL   = `${RESOURCE_DOMAIN}/adm/auth/login/force/`;
    const RESEND_VERIFY_URL   = `${RESOURCE_DOMAIN}/private/user/verify`;

    var user = null;
    var queue = [];
    var promiseOfUpdate = null;
    var filterUsers = [];
    var filterSettings = {};
    var showSettings = null;
    var profile = {};
    var profileFriends = [];

    var service = {
        getCurrentUser: getCurrentUser,
        setCurrentUser: setCurrentUser,
        getUser: getUser,
        checkAccess: checkAccess,
        getUserById: getUserById,
        isLogged: isLogged,
        updateUser: updateUser,
        updateUserViaQueue: updateUserViaQueue,
        login: login,
        logout: logout,
        signup: signup,
        recoveryPasswordByEmail: recoveryPasswordByEmail,
        changePassword: changePassword,
        updateAvatar: updateAvatar,
        getFilterUri: getFilterUri,
        getUsersByFilter: getUsersByFilter,
        applyUserFilter: applyUserFilter,
        getShowSettings: getShowSettings,
        getFilterSettings: getFilterSettings,
        loginAsUser: loginAsUser,
        getAdmUserById: getAdmUserById,
        getAdmFriendsByUserId: getAdmFriendsByUserId,
        getUsername: getUsername,
        getRoleOfUser: getRoleOfUser,
        isAdmin: isAdmin,
        resendVerifyEmail: resendVerifyEmail,
        addPoints: addPoints
    };

    return service;
    /////////////////////

    function getUsername(user){
        var name = `#${user.id}`;

        if (user.email) name = user.email;
        if (user.information.nickname) name = user.information.nickname;
        if (user.information.firstname && user.information.lastname) name = `${user.information.firstname} ${user.information.lastname}`;

        return name;
    }

    function getRoleOfUser(person) {
        var role = ROLES.ANONYM;

        if (isLogged()) {
            if (person.email) {
                var domain = person.email.split("@")[1];

                role = domain === 'jellychip.com' ? ROLES.ADMIN : ROLES.USER;
            } else {
                role = ROLES.USER;
            }
        }

        return role;
    }

    function isAdmin() {
        var isAdmin = false;

        if (isLogged()) {
            var role = getRoleOfUser(user);

            if (role === ROLES.ADMIN) {
                isAdmin = true;
            }
        }

        return isAdmin;
    }

    function getCurrentUser(){
        return user;
    }

    function setCurrentUser(newUser){
        user = newUser;
    }

    function checkAccess() {
        var deferred = $q.defer();

        $http.get(PROFILE_URL)
            .success(function(data, status, headers, config){
                if (angular.isObject(data.response.token)) {
                    user = data.response;

                    logger.info(`The user #${data.response.id} was logged`);

                    deferred.resolve(data.response);
                } else {
                    user = null;

                    logger.info(`The user is not authorized`);

                    deferred.reject();
                }

            }).error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getUser(){
        var deferred = $q.defer();

        $http.get(GET_URL)
            .success(function(data, status, headers, config){
                user = data.response;

                logger.info(`The user #${data.response.id} was received`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getUserById(id){
        var deferred = $q.defer();

        $http.get(`${PROFILE_URL}/${id}`)
            .success(function(data, status, headers, config){
                var response = {
                    user: data.response,
                    meta: {
                        points: data.meta.points,
                        friends: data.meta.friends
                    }
                };
                
                logger.info(`Profile of user #${id} was received`);

                deferred.resolve(response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function checkQueue(){
        if (queue.length && !queue[queue.length - 1].user){
            updateUserFromQueue(queue.length - 1).finally(checkQueue);
        } else {
            user = queue[queue.length - 1].user || user;
            promiseOfUpdate.resolve(angular.copy(user));

            queue = [];
            promiseOfUpdate = null;
            logger.success(`Your settings have been updated`);
        }
    }

    function updateUserViaQueue(changedUser){
        queue.push({
            data: changedUser,
            user: null
        });

        if (!promiseOfUpdate){
            promiseOfUpdate = $q.defer();

            updateUserFromQueue(queue.length - 1).finally(checkQueue);
        }

        return promiseOfUpdate.promise;
    }

    function updateUserFromQueue(index){
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: UPDATE_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.updateUser,
            data: queue[index].data
        }).success(function(data, status, headers, config){
            queue[index].user = data.response;

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            queue[index].user = angular.copy(user);

            deferred.reject();
        });

        return deferred.promise;
    }

    function updateUser(changedUser){
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: UPDATE_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.updateUser,
            data: changedUser
        }).success(function(data, status, headers, config){
            user = data.response;

            logger.success(`Your settings have been updated`);

            deferred.resolve(data.response);
        }).error(function(){
            deferred.reject(user);
        });

        return deferred.promise;
    }

    function login(email, password, rememberMe){
        var data = {
            user: {
                email: email,
                password: password
            },
            remember_me: !!rememberMe
        }

        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: LOGIN_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformUser,
            data: data
        }).success(function(data, status, headers, config){
            user = data.response;

            logger.info(`The user #${data.response.id} was logged`);

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function logout(){
        var deferred = $q.defer();

        $http.get(LOGOUT_URL)
            .success(function(data, status, headers, config){
                var message = data.meta.message || 'User was logged out.';

                user = null;
                logger.info(message);

                deferred.resolve(message);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function signup(email, password, rememberMe){
        var data = {
            user: {
                email: email,
                password: password
            },
            remember_me: !!rememberMe
        }

        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: REGISTER_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformUser,
            data: data
        }).success(function(data, status, headers, config){
            user = data.response;

            logger.info(`New user #${data.response.id} was created`);

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function recoveryPasswordByEmail(email){
        var data = {
            email: email,
        }

        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: RECOVERY_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformUser,
            data: data
        }).success(function(data, status, headers, config){
            var message = data.meta.message || 'New password was sent to your mailbox.';

            logger.success(message);

            deferred.resolve(message);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function changePassword(currentPassword, newPassword, confirmPassword){
        var data = {
            old: currentPassword,
            new: newPassword,
            confirm: confirmPassword
        }

        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: PASSWORD_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformUser,
            data: data
        }).success(function(data, status, headers, config){
            user = data.response;

            logger.success('Your settings have been updated');
            logger.info('Password was changed');

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function isLogged(){
        return user && angular.isObject(user.token);
    }

    function updateAvatar(file){
        var deferred = $q.defer();

        var data = {
            avatar: file
        };

        $http({
            method: 'POST',
            url: AVATAR_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        }).success(function(data, status, headers, config){

            user = data.response;
            logger.info('The avatar was updated');

            deferred.resolve(data.response);

        }).error(function(data, status, headers, config){
            if(data.meta && data.meta.errors)
                deferred.reject(data.meta.errors);
            else
                deferred.reject();
        });

        return deferred.promise;
    }

    function getFilterUri(filter){
        var uri = FILTER_URL + '?';
        angular.forEach(filter, (value, key)=> {
            if(value && (!value.from && !value.to))
                uri += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
            if(value.from)
                uri += encodeURIComponent(key) + '[from]=' + encodeURIComponent(value.from) + '&';
            if(value.to)
                uri += encodeURIComponent(key) + '[to]=' + encodeURIComponent(value.to) + '&';
        });

        return uri;
    }

    function _runFilterQuery(filter, deferred){

        var uri = getFilterUri(filter);

        filterSettings = filter;

        $http.get(uri)
            .success(function(data, status, headers, config){
                filterUsers[`${filter.offset}`] = data.response;
                logger.info(`Users were received`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getUsersByFilter(filter, show){
        var deferred = $q.defer();

        if(show)
            showSettings = show;

        if (filterUsers[`${filter.offset}`]){
            deferred.resolve(angular.copy(filterUsers[`${filter.offset}`]));
        } else {

            _runFilterQuery(filter, deferred);
        }

        return deferred.promise;
    }

    function applyUserFilter(filter, show){
        var deferred = $q.defer();
        if(show)
            showSettings = show;

        filterUsers.length = 0;

        _runFilterQuery(filter, deferred);

        return deferred.promise;
    }

    function getShowSettings(){
        if(showSettings){
            return showSettings;
        } else {
            showSettings = {
                nickname: true,
                jelly_points: true,
                survey_points: true,
                total_points_spent: true,
                total_products_bought: true,
                age: true,
                gender: true,
                birthday: true,
                last_login_date: true,
                last_login_ip: true,
                company: true,
                position: true,
                education: true,
                relationships: true,
                country: true,
                state: true,
                city: true,
                all: true
            };

            return showSettings;
        }
    }

    function getFilterSettings(){
        return filterSettings;
    }

    function loginAsUser(userId){
        var deferred = $q.defer();

        $http.post(LOGIN_AS_USER_URL + userId)
            .success(function(data, status, headers, config){
                user = data.response;

                logger.success(`You are logged as user #${data.response.id}`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getAdmUserById(id){
        var deferred = $q.defer();

        if (profile[`${id}`]){
            deferred.resolve(angular.copy(profile[`${id}`]));
        } else {

            $http.get(`${GET_ADM_URL}/${id}`)
                .success(function (data, status, headers, config) {
                    profile[`${id}`] = data.response;

                    logger.info(`Profile of user #${id} was received`);

                    deferred.resolve(data.response);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject();
                });
        }

        return deferred.promise;
    }

    function getAdmFriendsByUserId(id){
        var deferred = $q.defer();

        if(profileFriends[`${id}`]){
            deferred.resolve(angular.copy(profileFriends[`${id}`]));
        } else {
            $http.get(`${GET_FRIENDS_ADM}/${id}?approved=1`)
                .success(function(data, status, headers, config){
                    profileFriends[`${id}`] = data.response;

                    logger.success(`Friends of user #${id} was received`);

                    deferred.resolve(data.response);
                })
                .error(function(data, status, headers, config){
                    deferred.reject();
                });
        }


        return deferred.promise;
    }

    function resendVerifyEmail(){
        var deferred = $q.defer();

        $http.post(RESEND_VERIFY_URL)
            .success(function(data, status, headers, config){

                logger.success(`Confirmation email was sent.`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }
    
    function addPoints(points) {
        var currentUser = angular.copy(user),
            wallet = _.findWhere(currentUser.wallets, { type: "JELLY" });

        wallet.value += parseInt(points, 10);
        
        setCurrentUser(currentUser);
    }
}

export default User;
