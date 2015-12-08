var factory = function($http, $q, RESOURCE_DOMAIN, logger){
    const LIST_URL   = `${RESOURCE_DOMAIN}/private/payment/invoice/list`;
    const GET_URL    = `${RESOURCE_DOMAIN}/private/payment/invoice`;

    var service = {
        getMyInvoices: getMyInvoices,
        getMyInvoiceById: getMyInvoiceById,
        clearCache: clearCache
    };

    var invoices = null;

    return service;
    /////////////////////

    function getMyInvoices(){
        var deferred = $q.defer();

        if (invoices){
            deferred.resolve(angular.copy(invoices));
        } else {
            $http.get(LIST_URL)
                .success(function(data, status, headers, config){
                    invoices = data.response.items;

                    logger.info('Invoices were received');

                    deferred.resolve(data.response.items);
                })
                .error(function(data, status, headers, config){
                    deferred.reject();
                });
        }

        return deferred.promise;
    }

    function findinvoiceByID(invoiceId){
        return _.find(invoices, function(invoice){ return invoice.id == invoiceId });
    }

    function getMyInvoiceById(invoiceId){
        var deferred = $q.defer();

        if (invoices){
            var invoice = findinvoiceByID(invoiceId);

            if (invoices) {
                deferred.resolve(invoice);

                return deferred.promise;
            }
        }

        $http.get(`${GET_URL}/${invoiceId}`)
            .success(function(data, status, headers, config){
                logger.info(`The invoice #${invoiceId} was received`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function clearCache(){
        invoices = null;
    }
}

export default factory;
