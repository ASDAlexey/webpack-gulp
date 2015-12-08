var factory = function($http, $q, RESOURCE_DOMAIN, logger, dataTransformer){
    const EMAIL_URL         = `${RESOURCE_DOMAIN}/private/search/email`;
    const EMAIL_LIST_URL    = `${RESOURCE_DOMAIN}/private/search/email/list`;
    const SEARCH_URL        = `${RESOURCE_DOMAIN}/private/search/user`;

    var service = {
        search: search,
        searchByEmail: searchByEmail,
        searchByListEmails: searchByListEmails
    };

    return service;
    /////////////////////

    function search(searchQuery){
        var deferred = $q.defer();

        var data = {
            query: searchQuery
        };

        $http({
                method: 'POST',
                url: SEARCH_URL,
                headers: {'Content-Type': 'multipart/form-data'},
                transformRequest: dataTransformer.transformData,
                data: data
            })
            .success(function(data, status, headers, config){
                logger.info('Result of search was received');

                deferred.resolve(data.response.items);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function searchByEmail(email){
        var deferred = $q.defer();

        $http.get(`${EMAIL_URL}/${email}`)
            .success(function(data, status, headers, config){
                logger.info('Friends were received');

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function searchByListEmails(list) {
        var deferred = $q.defer();

        var data = {
            search_list: list.join(',')
        };

        $http({
            method: 'POST',
            url: EMAIL_LIST_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        }).success(function(data, status, headers, config){
            var foundContacts = {},
                absentContacts = data.meta.absent;

            if (data.response.items.length) {
                _.each(data.response.items, (value, key)=>{
                    foundContacts[data.meta.found[key]] = value;
                });
            }

            deferred.resolve({
                found: foundContacts,
                absent: absentContacts
            });
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }
}

export default factory;
