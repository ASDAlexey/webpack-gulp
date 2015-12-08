import passingCtrl from './passing-survey.controller.js';
import passingStyles from './assets/styles/passing.scss';

var module = angular
    .module('app.surveys.passing', [])
    .controller('SurveyPassing', passingCtrl)
;

export default module;
