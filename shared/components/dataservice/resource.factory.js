var Factory = function(RESOURCE_DOMAIN){

    var service = {
        getResourceURL: getResourceURL
    };

    return service;
    /////////////////////

    function getResourceURL(path) {
        if (angular.isUndefined(path)) return;
        
        return isAbsolutePath(path) ? path : `${RESOURCE_DOMAIN}/${path}`;
    }

    function isAbsolutePath(path) {
        return /^(?:[a-z]+:)?\/\//i.test(path);
    }
}

export default Factory;
