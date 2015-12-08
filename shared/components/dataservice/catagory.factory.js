var Category = function($http, $q, RESOURCE_DOMAIN, logger, dataTransformer){
    const LIST_URL   = `${RESOURCE_DOMAIN}/store/category/list`;
    const GET_URL    = `${RESOURCE_DOMAIN}/store/category/get`;
    const CREATE_URL = `${RESOURCE_DOMAIN}/dev/store/category/create`;
    const DELETE_URL = `${RESOURCE_DOMAIN}/dev/store/category/delete`;
    const UPDATE_URL = `${RESOURCE_DOMAIN}/dev/store/category/update`;

    var categories;

    var service = {
        getListOfCategories: getListOfCategories,
        getCategoryById: getCategoryById,
        getNewCategory: getNewCategory,
        saveCategory: saveCategory,
        removeCategory: removeCategory,
        findCategoryById: findCategoryById,
        findProduct: findProduct,
        findProductById: findProductById
    };

    return service;
    /////////////////////

    function getListOfCategories(){
        var deferred = $q.defer();

        if (categories){
            deferred.resolve(angular.copy(categories));
        } else {
            $http.get(LIST_URL)
                .success(function(data, status, headers, config){
                    categories = data.response.items;

                    logger.info('Categories were received');

                    deferred.resolve(categories);
                })
                .error(function(data, status, headers, config){
                    deferred.reject();
                });
        }

        return deferred.promise;
    }

    function findProduct(categoryId, productId){
        var category = findCategoryById(categoryId);
        return _.find(category.products, function(product){ return product.id == productId });
    }

    function findProductById(productId){

        var result = null;
        var keepGoing = true;
        angular.forEach(categories, (value, key)=>{

            if(keepGoing) {
                var product =  findProduct(value.id, productId);

                if(angular.isObject(product)){
                    keepGoing = false;
                    result = product;
                }
            }
        });

        return result;
    }

    function findCategoryById(categoryId){
        return _.find(categories, function(category){ return category.id == categoryId });
    }

    function getCategoryById(categoryId){

        var deferred = $q.defer();

        if (categories){
            var category = findCategoryById(categoryId);

            if (category) {
                deferred.resolve(angular.copy(category));

                return deferred.promise;
            }
        }

        $http.get(`${GET_URL}/${categoryId}`)
            .success(function(data, status, headers, config){
                if (categories){
                    var category = data.response;
                    categories.push(category);
                }

                logger.info(`Category #${data.response.id} was received`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getNewCategory(){
        return {
            colour: "cccccc",
            enable: true,
            name: ""
        }
    }

    function saveCategory(category){
        var deferred = $q.defer();

        if (category.id) {
            $http({
                method: 'POST',
                url: `${UPDATE_URL}/${category.id}`,
                headers: {'Content-Type': 'multipart/form-data'},
                transformRequest: dataTransformer.transformCategory,
                data: category
            }).success(function(data, status, headers, config){
                if (categories){
                    var category = data.response;
                    angular.forEach(categories, function(value, key){
                        if (value.id === category.id) categories[key] = category;
                    });
                }

                logger.success(`The category #${data.response.id} was updated`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });
        } else {
            $http({
                method: 'POST',
                url: CREATE_URL,
                headers: {'Content-Type': 'multipart/form-data'},
                transformRequest: dataTransformer.transformCategory,
                data: category
            }).success(function(data, status, headers, config){
                if (categories){
                    var category = data.response;
                    categories.push(category);
                }

                logger.success(`The category #${data.response.id} was added`);

                deferred.resolve(data.response);
            }).error(function(data, status, headers, config){
                deferred.reject();
            });
        }

        return deferred.promise;
    }

    function removeCategory(categoryId){
        var deferred = $q.defer();

        $http.delete(`${DELETE_URL}/${categoryId}`)
            .success(function(data, status){
                if (categories){
                    angular.forEach(categories, function(value, key){
                        if (value.id === categoryId) categories.splice(key, 1);
                    });
                }

                logger.success(`The category #${categoryId} was removed`);

                deferred.resolve(data.response);
            })
            .error(function(data, status){
                deferred.reject();
            });

        return deferred.promise;
    }
}

export default Category;
