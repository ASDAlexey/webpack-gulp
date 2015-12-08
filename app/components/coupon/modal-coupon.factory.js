import controller from './modal-coupon.controller.js';
import template from './modal-coupon.tmpl.html';

var service = function($injector, $modal){

    var service = {
        openModal: openModal
    }

    return service;
    /////////////////////

    function openModal(){
        var $location = $injector.get('$location'),
            searchObject = $location.search(),
            code;

        if (searchObject.hasOwnProperty('coupon')) {
            code = angular.isString(searchObject.coupon) ? searchObject.coupon : '';
        }
        
        return $modal.open({
            controller: controller,
            controllerAs: 'coupon',
            template: template,
            windowClass: 'coupon-modal',
            resolve: {
                couponCode: function() {
                    return code;
                }
            }
        });
    }
}

export default service;
