import styles from './assets/styles/coupon.scss';
import modalCoupon from './modal-coupon.factory.js';

var module = angular
    .module('app.coupon', [])
    .factory('modalCoupon', modalCoupon)
    .run(startModule)
;

function startModule($injector, $rootScope, modalCoupon) {
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        var $location = $injector.get('$location'),
            searchObject = $location.search();

        if (searchObject.hasOwnProperty('coupon')) {
            modalCoupon.openModal();
        }
    });
}

export default module;
