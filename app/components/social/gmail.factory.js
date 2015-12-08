/* global gapi */
var factory = function($window, $q, $http, logger){
    const CLIENT_ID = '380762253328-1hc0qlki2kevnudt7ute03apd4i1f6b3.apps.googleusercontent.com';
    const API_KEY = 'jellychip-001';
    const SCOPES = 'https://www.google.com/m8/feeds';

    var service = {
        loadAPI: loadAPI,
        getContacts: getContacts
    };

    return service;
    /////////////////////

    function loadAPI(){
        var deferred = $q.defer();

        if (isApiLoaded()) {
            deferred.resolve();
        } else {
            // If we've already installed the SDK, we're done
            if (document.getElementById('gapi')) {
                logger.info('Google SDK is loaded, but now is not available');

                deferred.reject();
            } else {
                 // Get the first script element, which we'll use to find the parent node
                var firstScriptElement = document.getElementsByTagName('script')[0];

                // Create a new script element and set its id
                var gapiScript = document.createElement('script');
                gapiScript.id = 'gapi';

                // Set the new script's source to the source of the Google API
                gapiScript.src = 'https://apis.google.com/js/client.js?onload=handlerGApiLoad';

                // Insert the Google API into the DOM
                firstScriptElement.parentNode.insertBefore(gapiScript, firstScriptElement);

                $window.handlerGApiLoad = ()=>{
                    gapi.client.setApiKey(API_KEY);
                    deferred.resolve();
                };
            }
        }

        return deferred.promise;
    }

    function isApiLoaded(){
        return angular.isDefined($window.gapi);
    }

    function getContacts(){
        var deferred = $q.defer();

        loadAPI().then(()=>{
            gapi.auth.authorize({
                client_id: CLIENT_ID,
                scope: SCOPES,
                immediate: false
            }, handleAuthResult);
        });

        function handleAuthResult(authResult) {
            if (authResult && !authResult.error) {
                $http({
                    method: 'GET',
                    url: `https://www.google.com/m8/feeds/contacts/default/full?alt=json&access_token=${authResult.access_token}&max-results=700&v=3.0`,
                    withCredentials: false
                }).success((data, status, headers, config)=>{
                    if (data.feed.entry.length > 0){
                        var contacts = convertContactsResponse(data.feed.entry);

                        deferred.resolve(contacts);
                    } else {
                        handleError();
                    }
                }).error(function(data, status, headers, config){
                    handleError();
                });
            } else {
                handleError();
            }
        }

        function convertContactsResponse(response){
            var contacts = [];

            _.forEach(response, function(contact){
                if (angular.isArray(contact.gd$email) && contact.gd$email[0].address) {
                    contacts.push({
                        fullName: angular.isObject(contact.gd$name) ? contact.gd$name.gd$fullName.$t : null,
                        email: contact.gd$email[0].address
                    });
                }
            });

            return contacts;
        }

        function handleError(){
            logger.error("Something went wrong! Your contact list is undefined");
            deferred.reject();
        }

        return deferred.promise;
    }
}

export default factory;
