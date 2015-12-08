import onlyNumbersDirective from './only-numbers.directive.js';
import onlyCountNumbers from './only-count-numbers.directive.js';

var module = angular
    .module('validate', [])
    .directive('onlyNumbers', ()=> new onlyNumbersDirective())
    .directive('onlyCountNumbers', ()=> new onlyCountNumbers());

export default module;