var Product = function($http, $q, RESOURCE_DOMAIN, logger, dataTransformer){
    const LIST_URL   = `${RESOURCE_DOMAIN}/store/product/list`;
    const GET_URL    = `${RESOURCE_DOMAIN}/store/product/get`;
    const CREATE_URL = `${RESOURCE_DOMAIN}/dev/store/product/create`;
    const DELETE_URL = `${RESOURCE_DOMAIN}/dev/store/product/delete`;
    const UPDATE_URL = `${RESOURCE_DOMAIN}/dev/store/product/update`;
    const BUY_URL    = `${RESOURCE_DOMAIN}/private/user/store/buy/product`;

    var service = {
        getProducts: getProducts,
        getProductById: getProductById,
        saveProduct: saveProduct,
        removeProduct: removeProduct,
        buyProduct: buyProduct
    };

    var products = [];

    return service;
    /////////////////////

    function getProducts(categoryId){
        var deferred = $q.defer();

        if (products[`${categoryId}`]){
            deferred.resolve(angular.copy(products[`${categoryId}`]));
        } else {
            $http.get(`${LIST_URL}?category=${categoryId}`)
                .success(function(data, status, headers, config){
                    products[`${categoryId}`] = data.response.items;

                    logger.info('The products were received');

                    deferred.resolve(data.response.items);
                })
                .error(function(data, status, headers, config){
                    deferred.reject();
                });
        }

        return deferred.promise;
    }

    function getProductById(productId){
        var deferred = $q.defer();

        if (products){
            var product = findProductByID(productId);

            if (product) {
                deferred.resolve(angular.copy(product));

                return deferred.promise;
            }
        }

        $http.get(`${GET_URL}/${productId}`)
            .success(function(data, status, headers, config){
                logger.success(`The product #${productId} was received`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function findProductByID(productId){
        var product = null;

        angular.forEach(products, (list, categoryId)=>{
            // this underscore code probably have an error!
            //product = _.find(list, function(product){ return product.id == productId });
            angular.forEach(list, (value, key)=>{
                if(value.id == productId){
                    product = value;
                }
            })
        });

        return product;
    }

    function saveProduct(changedProduct){
        var deferred = $q.defer();

        if (changedProduct.id){
            $http({
                method: 'POST',
                url: `${UPDATE_URL}/${changedProduct.id}`,
                headers: {'Content-Type': 'multipart/form-data'},
                transformRequest: dataTransformer.transformProduct,
                data: changedProduct
            }).success(function(data, status, headers, config){
                var cachedProduct = findProductByID(changedProduct.id);
                var updatedProduct = data.response;

                if (cachedProduct){
                    angular.forEach(products[changedProduct.category.id], function(value, key){
                        if (value.id === updatedProduct.id) products[changedProduct.category.id][key] = updatedProduct;
                    });
                }

                logger.success(`The product #${changedProduct.id} was updated`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });
        } else {
            $http({
                method: 'POST',
                url: CREATE_URL,
                headers: {'Content-Type': 'multipart/form-data'},
                transformRequest: dataTransformer.transformProduct,
                data: changedProduct
            }).success(function(data, status, headers, config){
                var newProduct = data.response;

                if (products[changedProduct.category]){
                    products[changedProduct.category].push(newProduct);
                }

                logger.success(`The product #${newProduct.id} was added`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });
        }

        return deferred.promise;
    }

    function removeProduct(productId){
        var deferred = $q.defer();

        $http.delete(`${DELETE_URL}/${productId}`)
            .success(function(data, status){
                var cachedProduct = findProductByID(productId);

                if (cachedProduct){
                    angular.forEach(products[cachedProduct.category.id], function(value, key){
                        if (value.id === productId) products[cachedProduct.category.id].splice(key, 1);
                    });
                }

                logger.success(`The product #${productId} was removed`);

                deferred.resolve(data.response);
            })
            .error(function(data, status){
                deferred.reject();
            });

        return deferred.promise;
    }

    function buyProduct(productId){
        var deferred = $q.defer();

        $http.post(`${BUY_URL}/${productId}/1`)
            .success(function(data, status){
                // logger.success(`The product #${productId} was purchased`);

                var response = {
                    achievement: data.meta.achievement,
                    order: data.response
                };

                deferred.resolve(response);
            })
            .error(function(data, status){
                deferred.reject();
            });

        return deferred.promise;
    }
}

export default Product;
