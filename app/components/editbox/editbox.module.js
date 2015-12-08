import directive from './editbox.directive.js';
import location from './location.directive.js';
import styles from './assets/styles/editbox.scss';

var editbox = angular
    .module('app.editbox', [])
    .directive('editbox', directive)
    .directive('location', location)
;

export default editbox;