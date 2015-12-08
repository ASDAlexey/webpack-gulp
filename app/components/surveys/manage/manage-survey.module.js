import manageCtrl from './manage-surveys.controller.js';
import manageTmpl from './manage-surveys.tmpl.html';
import manageStyles from './assets/styles/manage.scss';

var module = angular
    .module('app.surveys.manage', [])
    .run(runModule)
    .controller('SurveyManage', manageCtrl)
;

function runModule(router, config){
    var configRoute = {
        url: '/list',
        template: manageTmpl,
        controller: 'SurveyManage as survey',
        theme: 'light'
    };

    var configPage = {
        title: `Manage Surveys | ${config.title}`,
        theme: 'light'
    };

    router.setRoute('app.survey.manage', configRoute, configPage);

}

export default module;
