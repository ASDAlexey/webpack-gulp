import edit from './edit/edit-survey.module.js';
import manage from './manage/manage-survey.module.js';
import passing from './passing/passing-survey.module.js';

var module = angular
    .module('app.surveys', [
        'app.surveys.manage',
        'app.surveys.edit',
        'app.surveys.passing'
    ])
    .run(runModule)
;

function runModule(router){
    var configRoute = {
        url: '/survey',
        abstract: true,
        template: '<ui-view></ui-view>'
    };

    router.setRoute('app.survey', configRoute, {});
}

export default module;
