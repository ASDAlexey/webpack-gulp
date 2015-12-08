import styles from './assets/styles/preloader.scss';
import preloader from './preloader.factory.js';
import directive from './preloader.directive.js';

var module = angular
    .module('preloader', [])
    .factory('preloader', preloader)
    .directive('preloader', directive)
    .run(startModule)
;

function startModule($rootScope, preloader){
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        preloader.resetCounter();
    });
}

export default module;
