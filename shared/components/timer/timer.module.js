import timer from './timer.factory.js';

var module = angular
    .module('timer', [])
    .factory('Timer', timer)
;

export default module;
