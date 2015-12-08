import styles from './assets/styles/header.scss';
import Controller from './header.controller.js';

var header = angular
    .module('app.header', [])
    .controller('Header', Controller)
;

export default header;