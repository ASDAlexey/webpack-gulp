import styles from './assets/styles/payments.scss';
import service from './payment-modal.factory.js';
import controller from './payment-modal.controller.js';
import payments from './payments.factory.js';
import balanceDirective from './directives/balance-block.directive.js';
import highlightError from './directives/highlight-error.directive.js';
import addZero from './directives/add-zero.directive.js';

var module = angular
    .module('app.payments', [
        'angular-stripe'
    ])
    .controller('PaymentModal', controller)
    .factory('Payments', payments)
    .factory('paymentModal', service)
    .constant('COST_OF_RESPONSE', '0.30')
    .directive('balanceBlock', balanceDirective)
    .directive('addZero', ()=> new addZero())
    .directive('highlightError', ()=> new highlightError())
    // .run(startModule)
    .config(configure)
;

// function startModule() {
//     (function(){
//         // If we've already installed the SDK, we're done
//         if (document.getElementById('stripe-jssdk')) {return;}
//
//         // Get the first script element, which we'll use to find the parent node
//         var firstScriptElement = document.getElementsByTagName('script')[0];
//
//         // Create a new script element and set its id
//         var stripeJs = document.createElement('script');
//         stripeJs.id = 'stripe-jssdk';
//
//         // Set the new script's source to the source of the Stripe JS SDK
//         stripeJs.src = 'https://js.stripe.com/v2/';
//
//         // Insert the Stripe JS SDK into the DOM
//         firstScriptElement.parentNode.insertBefore(stripeJs, firstScriptElement);
//     }());
// }

function configure(stripeProvider) {
    var testKey = 'pk_8LDqMUvNJl8EhLKQsSU2rC1G45Bnz',
        prodKey = 'pk_live_lKoxxH8lmJOMmTMmOT2VrLQc',
        currentKey;

    currentKey = window.location.hostname === 'jellychip.com' || window.location.hostname === 'www.jellychip.com' ? prodKey : testKey;

    stripeProvider.setPublishableKey(currentKey);
}

export default module;
