import styles from './assets/styles/weather.scss';
import Controller from './weather.controller.js';
import factory from './weather.factory.js';

var module = angular
        .module('app.weather', [])
        .controller('Weather', Controller)
        .factory('Weather', factory)
    ;

export default module;