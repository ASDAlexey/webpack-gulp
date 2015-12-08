import Service from './logger.factory.js';
import styles from './assets/styles/logger.scss';

var logger = angular
    .module('app.logger', [])
    .factory('logger', Service)
;

export default logger;
