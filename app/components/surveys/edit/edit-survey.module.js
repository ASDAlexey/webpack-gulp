import angularDatepicker from './assets/js/libs/angular-datepicker.js';
import mbSlider from './assets/js/libs/jquery.mb.slider.js';
import metadata from './assets/js/libs/jquery.metadata.js';
import tagsInput from './assets/js/libs/ng-tags-input.min.js';
import timepicki from './assets/js/libs/timepicki.js';

import editCtrl from './edit-survey.controller.js';
import editTmpl from './edit-survey.tmpl.html';
import surveyDropdown from './survey-dropdown.directive.js';
import editStyles from './assets/styles/edit.scss';

var module = angular
    .module('app.surveys.edit', [
        'ngTagsInput',
        '720kb.datepicker'
    ])
    .run(runModule)
    .controller('SurveyEdit', editCtrl)
    .directive('surveyDropdown', surveyDropdown)
;

function runModule(router, config){
    var configRouteCreate = {
        url: '',
        views: {
            "@": {
                template: editTmpl,
                controller: 'SurveyEdit as survey'
            }
        }
    };

    var configCreatePage = {
        title: `New Survey | ${config.title}`,
        theme: 'light',
        redirect: '/create-a-survey.html'
    };

    var configRouteEdit = {
        url: '/:surveyId',
        views: {
            "@": {
                template: editTmpl,
                controller: 'SurveyEdit as survey'
            }
        }
    };

    var configCreateEdit = {
        title: `Edit Survey | ${config.title}`,
        theme: 'light'
    };

    router.setRoute('app.survey.create', configRouteCreate, configCreatePage);
    router.setRoute('app.survey.edit', configRouteEdit, configCreateEdit);
}
