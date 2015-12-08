import template from './home.tmpl.html';
import styles from './assets/styles/home.scss';
import Controller from './home.controller.js';

var home = angular
    .module('app.home', [])
    .run(startHome)
    .controller('Home', Controller)
;

function startHome(router){
    var configRoute = {
        url: '/',
        template: template,
        controller: 'Home as home'
    };

    var configPage = {
        theme: 'light'
    };

    router.setRoute('app.home', configRoute, configPage);
}

export default home;
