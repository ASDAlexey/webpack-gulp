import styles from './assets/styles/welcome.scss';
import Controller from './welcome.controller.js';
import template from './welcome.tmpl.html';

var module = angular
    .module('app.welcome', [
        'bm.bsTour'
    ])
    .run(startWelcome)
    .controller('Welcome', Controller)
;

function startWelcome(router, config){
    var configRoute = {
        url: '/welcome',
        template: template,
        controller: 'Welcome as welcome'
    };

    var configPage = {
        theme: 'light',
        title: `Welcome Tour | ${config.title}`
    };

    router.setRoute('app.welcome', configRoute, configPage);
}

export default module;