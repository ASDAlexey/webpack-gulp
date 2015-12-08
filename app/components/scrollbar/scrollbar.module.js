import styles from './assets/styles/scrollbar.css';
import directive from './scrollbar.directive.js';

var module = angular
    .module('app.scrollbar', [])
    .directive('ngScrollbar', directive)
;

export default module;