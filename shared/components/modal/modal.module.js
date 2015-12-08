import Factory from './modal.factory.js';

var modal = angular
    .module('modal', [])
    .factory('Modal', Factory)
;

export default modal;