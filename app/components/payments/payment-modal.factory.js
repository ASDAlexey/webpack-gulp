import template from './payment-modal.tmpl.html';

function paymentModal($modal, Payments){
    var settings = {
        template: template,
        controller: 'PaymentModal as modal',
        windowClass: 'payment-modal',
        size: 'lg'
    };

    var service = {
        show: show
    };

    return service;
    /////////////////////

    function show(survey) {
        settings.resolve = {
            survey: function () {
                return survey;
            }
        };

        return $modal.open(settings).result;
    }
}

export default paymentModal;
