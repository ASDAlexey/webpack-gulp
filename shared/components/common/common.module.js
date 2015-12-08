import Service from './common.service.js';
import fileModel from './file-model.directive.js';

var common = angular
    .module('common', [])
    .service('common', Service)
    .directive('fileModel', fileModel)
;

export default common;
