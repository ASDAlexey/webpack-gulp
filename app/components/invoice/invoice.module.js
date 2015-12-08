import Controller from './invoice.controller.js';
import orderNumFilter from './filters/order-num.filter.js'
import InvoicesTmpl from './invoces.tmpl.html';
import manageStyles from './assets/styles/invoice.scss';

var invoice = angular
    .module('app.invoice', [])
    .run(runModule)
    .controller('InvoiceCtrl', Controller)
    .filter('orderNum', orderNumFilter)
;

function runModule(router, config){
    var configRouteInvoice = {
        url: '/invoice',
        abstract: true,
        template: '<ui-view></ui-view>'
    };

    var configRouteList = {
        url: '/list',
        template: InvoicesTmpl,
        controller: 'InvoiceCtrl as invoice',
        theme: 'light'
    };

    var configModalRoute = {
        url: '/:invoiceId',
        views: {
            '@': {
                templateUrl: '/assets/templates/invoice.modal.html',
                controller: 'InvoiceCtrl as invoice'
            }
        }
    };

    router.setRoute('app.invoice', configRouteInvoice);
    router.setRoute('app.invoice.list', configRouteList, { title: `Invoices | ${config.title}`, theme: 'light' });
    router.setRoute('app.invoice.invoice', configModalRoute, { title: `Invoice | ${config.title}`, theme: 'light' });
}

export default invoice;