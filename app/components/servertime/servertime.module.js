import service from './servertime.factory.js';
import interceptor from './interceptor.factory.js';

var module = angular
    .module('app.servertime', [])
    .config(configure)
    .factory('Servertime', service)
    .factory('servertimeInterceptor', interceptor)
;

function configure($httpProvider){
    $httpProvider.interceptors.push('servertimeInterceptor');
}

export default module;
