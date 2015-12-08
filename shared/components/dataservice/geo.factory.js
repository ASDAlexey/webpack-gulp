var factory = function($http, $q, RESOURCE_DOMAIN, logger, dataTransformer){
    const COUNTRY_URL = `${RESOURCE_DOMAIN}/private/geo/country/find`;
    const CITY_URL    = `${RESOURCE_DOMAIN}/private/geo/location/find`;
    const STATE_URL   = `${RESOURCE_DOMAIN}/private/geo/district/find`;

    var service = {
        searchCountry: searchCountry,
        searchCity: searchCity,
        searchState: searchState,
        getLocation: getLocation
    };

    return service;
    /////////////////////

    function searchCountry(searchString){
        return $http.get(`${COUNTRY_URL}/${searchString}`).then(function(response){
            return response.data.response.items;
        });
    }

    function searchCity(stateId, searchString){
        return $http.get(`${CITY_URL}/${stateId}/${searchString}`).then(function(response){
            return response.data.response.items;
        });
    }

    function searchState(countryId, searchString){
        return $http.get(`${STATE_URL}/${countryId}/${searchString}`).then(function(response){
            return response.data.response.items;
        });
    }

    function getLocation(countryName, cityName){
        return $http.get(`${CITY_URL}/country/${countryName}/location/${cityName}`).then(function(response){
            return response.data.response;
        });
    }
}

export default factory;