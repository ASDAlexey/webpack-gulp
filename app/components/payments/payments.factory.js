function Payments($http, $q, RESOURCE_DOMAIN, logger, dataTransformer, stripe, Invoice){
    const CHARGE_URL   = `${RESOURCE_DOMAIN}/private/payment/charge`;

    var service = {
        charge: charge,
        isValidCard: isValidCard,
        isValidExpiry:isValidExpiry
    };

    return service;
    /////////////////////

    function charge(token, responses, surveyId, comment = '') {
        var data = {
            token: token,
            responses: responses,
            survey: surveyId,
            comment: comment
        };

        return $http({
            method: 'POST',
            url: CHARGE_URL,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        }).success(function(data, status, headers, config){
            logger.info(data.response.description);

            Invoice.clearCache();

            return data.response;
        });
    }

    function isValidCard(card){
        var isValid = true;

        if (!card.hasOwnProperty('number') || !stripe.card.validateCardNumber(card.number)) isValid = false;
        if (!card.hasOwnProperty('exp_month') || !card.hasOwnProperty('exp_year') || !stripe.card.validateExpiry(card.exp_month, card.exp_year)) isValid = false;
        if (!card.hasOwnProperty('cvc') || !stripe.card.validateCVC(card.cvc)) isValid = false;

        return isValid;
    }
    function isValidExpiry(card){
        var isValid = true;
        if (!stripe.card.validateExpiry(card.exp_month, card.exp_year)) isValid = false;
        return isValid;
    }
}

export default Payments;
