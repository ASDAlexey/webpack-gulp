import answersCtrl from './answers.controller.js';
import answersTmpl from './answers.tmpl.html';
import styles from './assets/styles/answers.scss';

import result from './result/result.module.js';

var module = angular
    .module('app.answers', [
        'app.answers.result'
    ])
    .run(runModule)
    .controller('Answers', answersCtrl);

function runModule(router, config){
    var configRoute = {
        url: '/answers',
        views: {
            "@": {
                template: answersTmpl,
                controller: 'Answers as answers'
            }
        }
    };

    var configPage = {
        title: `Answers | ${config.title}`,
        description: "Find Answers to survey questions on JellyChip's social network. Join in, answer surveys to get points and buy free life changing gifts.",
        access: 'public',
        theme: 'white'
    };

    router.setRoute('app.answers', configRoute, configPage);
}

export default module;
