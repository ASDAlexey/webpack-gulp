/* global gapi */
var factory = function($window, $q, $http, $location, logger){
    const CLIENT_ID = 'dj0yJmk9Z1FmU1RsZWp2b3dMJmQ9WVdrOVdsQTJWR05JTlRZbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD0yZg--';

    var token;

    var service = {
        refreshToken: refreshToken,
        getContacts: getContacts
    };

    return service;
    /////////////////////

    function refreshToken() {
        var deferred = $q.defer();

        var width  = 575,
            height = 400,
            left   = Math.round(($(document).width()  - width)  / 2),
            top    = Math.round(($(window).height() - height) / 2),
            options,
            popup,
            timer,
            redirectUrl = $location.absUrl(),
            url = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUrl}&response_type=token`;

        options = `
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

        popup = $window.open(url, '_blank', options);

        if (!popup) {
            logger.warning('Please, disable popup blocking');
        } else {
            timer = setInterval(function() {
                try {
                    var accessToken = popup.location.hash ? popup.location.hash.split('access_token=')[1].split('&')[0] : '';

                    if (accessToken) {
                        popup.close();
                        clearInterval(timer);

                        token = accessToken;
                        deferred.resolve(token);
                    } else if (popup.closed) {
                        clearInterval(timer);

                        logger.info('Login has been cancelled');
                        deferred.reject();
                    }
                }
                catch (error) {}
            }, 100);
        }

        return deferred.promise;
    }

    function getContacts() {
        var deferred = $q.defer();

        if (!token) {
            refreshToken().then(handleImportOfContacts);
        } else {
            handleImportOfContacts(token);
        }

        function handleImportOfContacts(token) {
            // use proxy server because social.yahooapis.com is blocked CORS
            // actually request url https://social.yahooapis.com/v1/user/me/contacts?format=json
            $http({
                method: 'GET',
                url: 'https://yahoo.jellychip.com/v1/user/me/contacts?format=json',
                withCredentials: false,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${token}`
                }
            }).success(function(data, status, headers, config){
                var contacts = convertContactsResponse(data);

                deferred.resolve(contacts);
            }).error(function(data, status, headers, config){
                logger.error("Something went wrong! Your contact list is undefined");
                deferred.reject();
            });
        }

        return deferred.promise;
    }

    function convertContactsResponse(response){
        var contacts = [];

        if (response.contacts && response.contacts.count > 0) {
            _.forEach((response.contacts.contact), function(contact){
                var user = {};

                _.forEach((contact.fields), function(field){
                    switch (field.type) {
                        case 'email':
                            user.email = field.value;
                            break;
                        case 'name':
                            user.fullName = `${field.value.givenName} ${field.value.familyName}`.trim();
                            break;
                    }
                });

                if (user.email) {
                    contacts.push(user);
                }
            });
        }

        return contacts;
    }
}

export default factory;
