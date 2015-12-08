var factory = function($http, $q, RESOURCE_DOMAIN, logger, dataTransformer){
    const LIST_URL   = `${RESOURCE_DOMAIN}/dev/gift/list`;
    const GET_URL    = `${RESOURCE_DOMAIN}/dev/gift/get`;
    const UPDATE_URL = `${RESOURCE_DOMAIN}/dev/gift/update`;
    const CREATE_URL = `${RESOURCE_DOMAIN}/dev/gift/create`;
    const REMOVE_URL = `${RESOURCE_DOMAIN}/dev/gift/remove`;

    var service = {
        getGifts: getGifts,
        saveGift: saveGift,
        getGiftById: getGiftById,
        removeGift: removeGift
    };

    var gifts = null;

    return service;
    /////////////////////

    function getGifts(){
        var deferred = $q.defer();

        if (gifts){
            deferred.resolve(angular.copy(gifts));
        } else {
            $http.get(LIST_URL)
                .success(function(data, status, headers, config){
                    gifts = data.response.items;

                    logger.info('Gifts were received');

                    deferred.resolve(data.response.items);
                })
                .error(function(data, status, headers, config){
                    deferred.reject();
                });
        }

        return deferred.promise;
    }

    function findGiftByID(giftId){
        return _.find(gifts, function(gift){ return gift.id == giftId });
    }

    function getGiftById(giftId){
        var deferred = $q.defer();

        if (gifts){
            var gift = findGiftByID(giftId);

            if (gift) {
                deferred.resolve(gift);

                return deferred.promise;
            }
        }

        $http.get(`${GET_URL}/${giftId}`)
            .success(function(data, status, headers, config){
                logger.info(`The gift #${giftId} was received`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function saveGift(gift){
        var deferred = $q.defer();

        if (gift.id) {
            $http({
                method: 'POST',
                url: `${UPDATE_URL}/${gift.id}`,
                headers: {'Content-Type': 'multipart/form-data'},
                transformRequest: dataTransformer.transformGift,
                data: gift
            }).success(function(data, status, headers, config){
                if (gifts){
                    var gift = data.response;
                    angular.forEach(gifts, function(value, key){
                        if (value.id === gift.id) gifts[key] = gift;
                    });
                }

                logger.success(`The gift #${data.response.id} was updated`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });
        } else {
            $http({
                method: 'POST',
                url: CREATE_URL,
                headers: {'Content-Type': 'multipart/form-data'},
                transformRequest: dataTransformer.transformGift,
                data: gift
            }).success(function(data, status, headers, config){
                if (gifts){
                    var gift = data.response;
                    gifts.push(gift);
                }

                logger.success(`The gift #${data.response.id} was added`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });
        }

        return deferred.promise;
    }

    function removeGift(giftId){
        var deferred = $q.defer();

        $http.delete(`${REMOVE_URL}/${giftId}`)
            .success(function(data, status){
                if (gifts){
                    angular.forEach(gifts, function(value, key){
                        if (value.id === giftId) gifts.splice(key, 1);
                    });
                }

                logger.success(`The gift #${giftId} was removed`);

                deferred.resolve(data.response);
            })
            .error(function(data, status){
                deferred.reject();
            });

        return deferred.promise;
    }
}

export default factory;
