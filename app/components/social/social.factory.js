import controller from './modal-invite.controller.js';
import template from './modal-invite.tmpl.html';

var factory = function($http, $q, $window, $rootScope, $location, $facebook, $linkedIn, $modal, Resource, RESOURCE_DOMAIN, logger, dataTransformer, User, Geo, Achievement, Gmail, Yahoo, config){
    const GET_URL      = `${RESOURCE_DOMAIN}/private/user/get`;
    const FACEBOOK_URL = `${RESOURCE_DOMAIN}/auth/login/fb`;
    const LINKEDIN_URL = `${RESOURCE_DOMAIN}/auth/login/ln`;
    const GET_TWITTER_AUTH_URL = `${RESOURCE_DOMAIN}/public/twitter/auth/url`;
    const TWITTER_AUTH = `${RESOURCE_DOMAIN}/public/twitter/auth/auth`;

    var hasAddedEventListener = false;
    var twitterAuthLink = false;

    var service = {
        importFromFacebook: importFromFacebook,
        importFromLinkedIn: importFromLinkedIn,
        loginViaFacebook: loginViaFacebook,
        loginViaLinkedIn: loginViaLinkedIn,
        shareAchievementViaTwitter: shareAchievementViaTwitter,
        shareAchievementViaFacebook: shareAchievementViaFacebook,
        shareAchievementViaEmail: shareAchievementViaEmail,
        openModalInviteFriends: openModalInviteFriends,
        getContactsFromGmail: getContactsFromGmail,
        getContactsFromOutlook: getContactsFromOutlook,
        getContactsFromHotmail: getContactsFromHotmail,
        getContactsFromYahoo: getContactsFromYahoo,
        getTwitterAuthUrl: getTwitterAuthUrl,
        authViaTwitter: authViaTwitter
    }

    return service;
    /////////////////////

    function importFromFacebook(){
        var deferred = $q.defer();

        $facebook.login().then(()=>{
            $facebook.api("/me", { fields: "id,address,birthday,education,email,first_name,gender,last_name,location,relationship_status,work" }).then((response)=>{
                // User.getUser().then((user)=>{
                //     if (response.email !== user.email) logger.warning(`Your emails do not match.\nFacebook: ${response.email}.\nCurrent email: ${user.email}`.);
                // });

                if(response.location){
                    $facebook.api("/" + response.location.id, { }).then((data)=>{
                        Geo.getLocation(data.location.country, data.location.city).then((data)=>{
                            var location = _.find(data, (obj)=>{return obj});

                            User.updateUser(dataTransformer.getUserFromFacebook(response, location)).then(function(user){

                                deferred.resolve(user);
                            });
                        });
                    });
                } else {
                    User.updateUser(dataTransformer.getUserFromFacebook(response)).then(function(user){

                        deferred.resolve(user);
                    });
                }
            }, function(err){
                deferred.reject();
            });
        });

        return deferred.promise;
    }

    function importFromLinkedIn(){
        var deferred = $q.defer();

        $linkedIn.authorize().then((data)=>{
            $linkedIn.profile('me', 'id,first-name,last-name,location,positions,email-address,educations,date-of-birth', {'format': 'json'}).then((response)=>{
                var data = response.values[0];

                // User.getUser().then((user)=>{
                //     if (data.emailAddress !== user.email) logger.warning(`Your emails do not match.\nLinkedIn: ${data.email}.\nCurrent email: ${user.email}.`);
                // });

                var user = angular.copy(User.getCurrentUser());

                User.updateUser(dataTransformer.getUserFromLinkedIn(response, user)).then(function(user){
                    deferred.resolve(user);
                });
            }, function(err){
                deferred.reject();
            });
        });

        return deferred.promise;
    }

    function loginViaFacebook(){
        var deferred = $q.defer();

        // Chrome iOS doesn't support the FB.login
        // open FB login page in new window, login and close window
        // http://www.seanshadmand.com/2015/03/06/facebook-js-login-on-chrome-ios-workaround/
        if (navigator.userAgent.match('CriOS')) {
            var popup,
                absoluteUrl = $location.absUrl(),
                clientId = "?client_id=" + $facebook.config('appId'),
                redirectUri = "&redirect_uri=" + absoluteUrl,
                scope = "&scope=" + $facebook.config('permissions').replace(/\s+/g, ''),
                url = 'https://www.facebook.com/dialog/oauth' + clientId + redirectUri + scope;

            // listen the transmitted events from popup window
            var removeListener = $rootScope.$on('fb.auth.authResponseChange', (event, response, FB)=>{
                if (response.status !== "connected"){
                    deferred.reject();
                } else {
                    angular.bind(this, loginViaAPI)();
                }

                removeListener();
            });

            popup = window.open(url);

             if (!popup) {
                 alert('Please, disable popup blocking');
             }
        } else {
             $facebook.login().then((data)=>{
                angular.bind(this, loginViaAPI)();
            });
        }

        function loginViaAPI(){
            var data = {
                token: $facebook.getAuthResponse()['accessToken']
            };

            $http({
                method: 'POST',
                url: FACEBOOK_URL,
                headers: {'Content-Type': 'multipart/form-data'},
                transformRequest: dataTransformer.transformData,
                data: data
            }).success(function(data, status, headers, config){
                deferred.resolve({ 'user': data.response, 'isNewUser': !!data.meta.registered });
            }).error(function(data, status, headers, config){
                deferred.reject();
            });
        }

        return deferred.promise;
    }

    function loginViaLinkedIn(){
        var deferred = $q.defer();

        var LINKEDIN_APP_ID = $linkedIn.config('appKey'),
            interval,
            popup,
            code,
            linkedInRedirectUri = `${location.protocol}//${location.hostname}`,
            linkedInUrl = `https://www.linkedin.com/uas/oauth2/authorization?client_id=${LINKEDIN_APP_ID}&redirect_uri=${linkedInRedirectUri}&response_type=code&state=DCEeFWf45A53sdfKef424&scope=r_basicprofile+r_emailaddress`,
            popupWidth = 575,
            popupHeight = 530,
            popupLeft = (window.screen.width - popupWidth) / 2,
            popupTop = (window.screen.height - popupHeight) / 2;

        popup = window.open(linkedInUrl, '', `width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop}`);
        interval = setInterval(checkCode, 500);

        function checkCode(){
            try {
                if(popup.location.search.split('code=')[1].split('&')[0]){
                    code = popup.location.search.split('code=')[1].split('&')[0];
                    popup.close();
                    clearInterval(interval);

                    var data = {
                        token: code
                    }

                    $http({
                        method: 'POST',
                        url: LINKEDIN_URL,
                        headers: {'Content-Type': 'multipart/form-data'},
                        transformRequest: dataTransformer.transformData,
                        data: data
                    }).success(function(data, status, headers, config){
                        deferred.resolve({ 'user': data.response, 'isNewUser': !!data.meta.registered });
                    }).error(function(data, status, headers, config){
                        deferred.reject();
                    });
                } else if (popup.location.search.split('error=')[1].split('&')[0]){
                    var message = 'LibkedIn error is occurred. Please try again later.';

                    logger.error(message);
                    popup.close();
                    clearInterval(interval);

                    deferred.reject(message);
                }
            } catch (error) {
                if(popup.closed){
                    var message = 'LibkedIn error is occurred. Please try again later.';

                    logger.error(message);
                    clearInterval(interval);

                    deferred.reject(message);
                }
            }
        }

        return deferred.promise;
    }

    function getShareText(achievement){
        var user,
            username = '';

        if (User.isLogged()){
            user = angular.copy(User.getCurrentUser());
        }

        if (user && user.id === achievement.user.id) {
            username = 'I\'ve';
        } else if(achievement.user.information.firstname && achievement.user.information.lastname){
            username = `${achievement.user.information.firstname} ${achievement.user.information.lastname}`;
        } else if (achievement.user.information.nickname){
            username = achievement.user.information.nickname;
        } else {
            username = `Jelly User #${achievement.user.id}`;
        }

        return `${username} just bought a '${achievement.gift.name}' gift to help change lives on JellyChip. Check it out and let's change the world.`;
    }

    function getAchievementTweetText(achievement, hashtag) {
        const TWITTER_MAX_SHORT_URL_LENGTH = 23;
        const TWITTER_MAX_LENGTH = 130;

        var text = getShareText(achievement),
            length = unorm.nfc(`${text}  #${hashtag}`).length + TWITTER_MAX_SHORT_URL_LENGTH;

        if (length > TWITTER_MAX_LENGTH){
            text = text.substring(0, text.indexOf('.') + 1);

            //if (parseInt(unorm.nfc(`${text} Check it out.  #${hashtag}`).length + TWITTER_MAX_SHORT_URL_LENGTH) < TWITTER_MAX_LENGTH){
            //    text += ' Check it out.';
            //}
        }

        return text;
    }

    function openShareWindow(url, name){
        var width  = 575,
            height = 300,
            left   = Math.round(($(document).width()  - width)  / 2),
            top    = Math.round(($(window).height() - height) / 2);

        var options = `
            status=1,
            width=${width},
            height=${height},
            top=${top},
            left=${left},
            location=0,
            menubar=0,
            toolbar=0,
            status=0,
            scrollbars=1,
            resizable=1
        `;

        var popup = $window.open(url, '_blank', options);

        if (!popup) {
            logger.warning('Please, disable popup blocking');
        }

        if (popup && config.isIE) {

            var interval = window.setInterval(function() {
                try {
                    if (popup == null || popup.closed) {
                        window.clearInterval(interval);

                        Achievement.rewardTw().then((data)=>{
                            addPointsToUser(data.add_points);
                        });
                    }
                }
                catch (e) {
                }
            }, 1000);
        }

        return popup;
    }

    function shareAchievementViaTwitter(link, achievement){
        var hashtag = 'jellychip';
        var tweet = getAchievementTweetText(achievement, hashtag);
        //var url = `https://twitter.com/share?url=${link}&hashtags=${hashtag}&text=${encodeURIComponent(tweet)}`;

        authViaTwitter().then((isAuth)=>{
            if(isAuth){
                var message = encodeURIComponent(`${tweet} ${link} #${hashtag}`);
                var filepath = achievement.gift.image.path;
                var popup = openShareWindow(`${window.location.protocol}//${window.location.host}/tweet.html?tweet=${message}&image=${filepath}`);
                setTimeout(function(){
                    popup.postMessage("connnect", `${window.location.protocol}//${window.location.host}/tweet.html?tweet=${message}&image=${filepath}`);
                },500);

            } else {
                getTwitterAuthUrl(true).then((url)=>{
                    var popup = openShareWindow(url, 'twitter');

                    var interval = window.setInterval(function() {
                        try {
                            if (popup.location.search.split('oauth_verifier=')[1].split('&')[0]) {

                                var twitterAccessToken = popup.location.search.split('oauth_verifier=')[1].split('&')[0];

                                popup.close();
                                window.clearInterval(interval);

                                authViaTwitter(twitterAccessToken).then((isAuth)=>{
                                    if(isAuth){
                                        var message = encodeURIComponent(`${tweet} ${link} #${hashtag}`);
                                        var filepath = achievement.gift.image.path;
                                        var popup = openShareWindow(`${window.location.protocol}//${window.location.host}/tweet.html?tweet=${message}&image=${filepath}`);
                                        setTimeout(function(){
                                            popup.postMessage("connnect", `${window.location.protocol}//${window.location.host}/tweet.html?tweet=${message}&image=${filepath}`);
                                        },500);

                                    }
                                });

                                if(popup.location.search.split('error=')[1].split('&')[0]){
                                    alert('Twitter error is occurred. Please try again later.');
                                    popup.close();
                                    window.clearInterval(interval);
                                }
                            }
                        }
                        catch (e) {
                            if(popup == null || popup.closed){
                                clearInterval(interval);
                            }
                        }
                    }, 100);
                });
            }
        });

        var callback = function(e){

            if (e.origin !== window.location.protocol + '//' + window.location.host)
                return;

            if (e.data && e.data.indexOf('tweet') > -1){
                Achievement.rewardTw().then((data)=>{
                    addPointsToUser(data.add_points);
                });

                if (window.removeEventListener) {
                     window.removeEventListener("message", callback, false);
                     hasAddedEventListener = false;
                } else if (element.detachEvent) { // IE
                     window.detachEvent("onmessage", callback);
                     hasAddedEventListener = false;
                }
            }
        };

        //check if user tweet link
        if (!hasAddedEventListener) {
            if (window.addEventListener) {
                 window.addEventListener("message", callback, false);
                 hasAddedEventListener = true;
            } else if (element.attachEvent) { // IE
                 window.attachEvent("onmessage", callback);
                 hasAddedEventListener = true;
            }
        }
    }

    function shareAchievementViaFacebook(link, achievement){

        var path = achievement.gift.share_icon ? achievement.gift.share_icon.path : achievement.gift.icon.path;

        $facebook.ui({
            method: 'feed',
            name: 'JellyChip',
            link: link,
            picture: Resource.getResourceURL(path),
            caption: $window.location.hostname,
            description: getShareText(achievement),
            message: ''
        }).then((response)=>{
            if(response){
                Achievement.rewardFb().then((data)=>{
                    addPointsToUser(data.add_points);
                });
            }
        });

        // var url = `https://www.facebook.com/sharer/sharer.php?u=${link}`;
        // openShareWindow(url, 'facebook');
    }

    function addPointsToUser(points) {
        if (points > 0 && User.isLogged()) {
            // update current user
            User.getUser();
        }
    }

    function shareAchievementViaEmail(link, achievement){

        var subject = 'Let\'s Change Lives together!';
        var text = getShareText(achievement);

        var body = `Hey,%0A%0A${text}%0A%0A${link}`;

        return `mailto:?subject=${subject}&body=${body}`;
    }

    function openModalInviteFriends(step = 1){
        var modalInstance = $modal.open({
            controller: controller,
            controllerAs: 'invite',
            template: template,
            windowClass: 'friends-modal',
            resolve: {
                modalStep: function(){
                    return step;
                }
            }
        });

        return modalInstance.result;
    }

    function getContactsFromGmail() {
        return Gmail.getContacts();
    }

    function getContactsFromMicrosoft() {
        var deferred = $q.defer();

        hello('windows')
            .login({ scope: "wl.basic, wl.contacts_emails" })
            .then((session)=>{
                hello('windows').api('me/contacts').then((response)=>{
                    var contacts = convertContactsResponse(angular.copy(response.data));

                    deferred.resolve(contacts);
                }, handleError);
            }, handleError);

        function handleError(error){
            logger.error("Something went wrong! Your contact list is undefined");
            deferred.reject();
        }

        function convertContactsResponse(contacts){
            var data = [];

            _.forEach(contacts, function(contact){
                if (contact.emails.preferred) {
                    data.push({
                        fullName: contact.name,
                        email: contact.emails.preferred
                    });
                }
            });

            return data;
        }

        return deferred.promise;
    }

    function getContactsFromOutlook() {
        return getContactsFromMicrosoft();
    }

    function getContactsFromHotmail() {
        return getContactsFromMicrosoft();
    }

    function getContactsFromYahoo() {
       return Yahoo.getContacts();
    }

    function getTwitterAuthUrl(force = false){

        var deferred = $q.defer();

        if(twitterAuthLink && !force){
            deferred.resolve(twitterAuthLink);
        } else {
            $http.post(GET_TWITTER_AUTH_URL)
                .success(function(data, status, headers, config){
                    logger.info(`Twitter auth link was received`);

                    twitterAuthLink = data.response;

                    deferred.resolve(data.response);
                })
                .error(function(data, status, headers, config){
                    deferred.reject();
                });
        }

        return deferred.promise;
    }

    function authViaTwitter(verifier = null){
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: TWITTER_AUTH,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: verifier ? {verifier: verifier} : null
        })
            .success(function(data, status, headers, config){
                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }
};

export default factory;
