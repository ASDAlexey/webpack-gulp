import template from './store.tmpl.html';
import styles from './assets/styles/store.scss';
import Controller from './store.controller.js';


var store = angular
    .module('app.store', [])
    .run(startStore)
    .controller('Store', Controller)
;

function startStore(router, config){

    var configRoute = {
        url: '/store',
        template: template,
        controller: 'Store as store'
    };

    var configPage = {
        theme: 'light',
        title: `Store | ${config.title}`,
        access: 'public'
    };

    router.setRoute('app.store', configRoute, configPage);
}

export default store;