import resultCtrl from './result.controller.js';
import resultTmpl from './result.tmpl.html';
import styles from './assets/styles/result.scss';

var module = angular
    .module('app.answers.result', [])
    .run(runModule)
    .controller('AnswersResult', resultCtrl)
;

function runModule(router, config){
    var configRoute = {
        url: '/:surveyId',
        views: {
            "@": {
                template: resultTmpl,
                controller: 'AnswersResult as answers'
            }
        }
    };

    var configPage = {
        title: `Answers | ${config.title}`,
        theme: 'white'
    };

    router.setRoute('app.answers.result', configRoute, configPage);
}

export default module;
