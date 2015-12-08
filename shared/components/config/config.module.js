/* global __PROD__ */
import value from './config.value.js';
import detectDeviceMode from './detect-device-mode.directive.js';

var configModule = angular
    .module('config', ['ui.router'])
    .value('config', value)
    .directive('detectDeviceMode', detectDeviceMode)
    .config(configure)
    .run(startConfig)
;

function startConfig($rootScope, config, router){
    // settings of project will be accessible in every scope
    $rootScope.config = config;
    $rootScope.router = router;

    // includes underscore's API
    $rootScope._ = _;
}

function configure($logProvider, $stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, routerConfigProvider){
    // turn debugging off/on (no info or warn)
    if (__PROD__) {
        $logProvider.debugEnabled(false);
    }

    routerConfigProvider.config.$stateProvider = $stateProvider;
    routerConfigProvider.config.$urlRouterProvider = $urlRouterProvider;
    routerConfigProvider.config.$locationProvider = $locationProvider;

    $httpProvider.defaults.withCredentials = true;
}

export default configModule;
