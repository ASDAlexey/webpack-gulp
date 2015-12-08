var Coupon = function($http, $q, $rootScope, RESOURCE_DOMAIN, logger, dataTransformer){
    const FILTER_URL        = `${RESOURCE_DOMAIN}/adm/coupons/list`;
    const GENERATE_URL      = `${RESOURCE_DOMAIN}/adm/coupons/generate`;
    const DELETE_URL        = `${RESOURCE_DOMAIN}/adm/coupons/delete`;
    const SEND_URL          = `${RESOURCE_DOMAIN}/private/coupons/send`;
    const RESEND_URL        = `${RESOURCE_DOMAIN}/private/coupons/resend`;
    const APPLY_URL         = `${RESOURCE_DOMAIN}/private/coupons/apply`;

    var filterCoupons = {};
    var filterSettings = {};
    var orderSettings = null;

    var service = {
        getFilterUri: getFilterUri,
        getCouponsByFilter: getCouponsByFilter,
        applyFilter: applyFilter,
        getFilterSettings: getFilterSettings,
        getOrderSettings: getOrderSettings,
        removeCoupon: removeCoupon,
        generateCoupons: generateCoupons,
        sendCoupon: sendCoupon,
        sendEmailCoupon: sendEmailCoupon,
        redeemCoupon: redeemCoupon,
        resendCoupon: resendCoupon
    };

    return service;
    /////////////////////

    function getFilterUri(filter){
        var uri = FILTER_URL + '?';
        angular.forEach(filter, (value, key)=> {
            if(value && (!value.from && !value.to) && (key != 'order'))
                uri += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
            if(value.from)
                uri += encodeURIComponent(key) + '[from]=' + encodeURIComponent(value.from) + '&';
            if(value.to)
                uri += encodeURIComponent(key) + '[to]=' + encodeURIComponent(value.to) + '&';
            if(key == 'order'){
                angular.forEach(value, (val, k)=>{
                    if(val)
                        uri += 'order[' + encodeURIComponent(k) + ']=' + encodeURIComponent(val) + '&';
                });
            }
        });

        return uri;
    }

    function _runFilterQuery(filter, deferred){

        var uri = getFilterUri(filter);

        filterSettings = filter;

        $http.get(uri)
            .success(function(data, status, headers, config){
                filterCoupons[`${filter.offset}`] = data.response;
                logger.info('Coupons were received');

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getCouponsByFilter(filter){
        var deferred = $q.defer();

        // if (filterCoupons[`${filter.offset}`]){
        //     deferred.resolve(angular.copy(filterCoupons[`${filter.offset}`]));
        // } else {

        //     _runFilterQuery(filter, deferred);
        // }
        _runFilterQuery(filter, deferred);

        return deferred.promise;
    }

    function applyFilter(filter){
        var deferred = $q.defer();

        filterCoupons = {};

        _runFilterQuery(filter, deferred);

        return deferred.promise;
    }

    function getFilterSettings(){
        return filterSettings;
    }

    function removeCoupon(id, filter){
        var deferred = $q.defer();

        $http.delete(`${DELETE_URL}/${id}`)
            .success(function(data, status, headers, config){
                //save only page where we delete coupons
                var couponsPageCopy = angular.copy(filterCoupons[`${filter.offset}`]);
                filterCoupons = {};
                filterCoupons[`${filter.offset}`] = couponsPageCopy;

                angular.forEach(filterCoupons[`${filter.offset}`].items, function(value, key){
                    if (value.id === id) filterCoupons[`${filter.offset}`].items.splice(key, 1);
                });

                // var filterCopy = angular.copy(filter);
                // filterCopy.offset = (filter.offset + filter.limit) - 1;
                // filterCopy.limit = 1;

                // var uri = getFilterUri(filterCopy);

                // $http.get(uri).success((data) => {

                //     angular.forEach(data.response.items, function(value, key){
                //         filterCoupons[`${filter.offset}`].items.push(value);
                //     });

                //     logger.info('Coupons were received');
                // });

                logger.success(`Coupon #${id} was deleted`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getOrderSettings(){
        if(orderSettings){
            return orderSettings;
        } else {
            orderSettings = {
                id: false,
                code: false,
                type: false,
                owner: false,
                data: false,
                begin: false,
                expire: false,
                status: false
            };

            return orderSettings;
        }
    }

    function generateCoupons(data){
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: GENERATE_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        })
            .success(function(data, status, headers, config){
                logger.success('Coupons were generated');

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function sendCoupon(coupon, force, user){
        var deferred = $q.defer();
        var ownerString = '';

        if(angular.isNumber(user)){
            ownerString = `#${user}}`;
        } else {
            ownerString = user;
            user = user.substring(user.lastIndexOf('#')+1,user.indexOf(' '));
        }

        $http({
            method: 'POST',
            url: `${SEND_URL}/${coupon}/${user}`,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: {"force":force}
        }).success(function(data, status, headers, config){
                angular.forEach(filterCoupons, (list, key)=>{
                    angular.forEach(list.items, (value, k)=>{
                        if(value.id == data.response.id){
                            value.owner = ownerString;
                            value.status = 'sent';
                        }
                    })
                });

                logger.success(`Coupon #${coupon} sent to user #${user}`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function sendEmailCoupon(coupon, email, force){
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: `${SEND_URL}/${coupon}/email/${email}`,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: {"force":force}
        }).success(function(data, status, headers, config){
                angular.forEach(filterCoupons, (list, key)=>{
                    angular.forEach(list.items, (value, k)=>{
                        if(value.id == data.response.id){
                            value.owner = data.response.owner ? `#${data.response.owner} ` : '';
                            value.description = data.response.description;

                            value.status = 'sent';
                        }
                    })
                });

                logger.success(`Coupon #${coupon} sent to ${email}`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function resendCoupon(coupon){
        var deferred = $q.defer();

        $http.post(`${RESEND_URL}/${coupon}`)
            .success(function(data, status, headers, config){

                logger.success(`Coupon #${coupon} was resended`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function redeemCoupon(code) {
        var deferred = $q.defer(),
            parameters = '?_format=json';

        if (code) parameters += `&code=${code}`;

        $http.get(APPLY_URL + parameters)
            .success(function(data, status, headers, config){
                // logger.success('The coupon was redeemed');

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                var errors = data.meta.errors.length ? data.meta.errors : [];

                deferred.reject(errors);
            });

        return deferred.promise;
    }
}

export default Coupon;
