import styles from './assets/styles/achievement.scss';
import Controller from './achievement.controller.js';
import reply from './directives/reply.directive.js';

var module = angular
    .module('app.achievement', [])
    .run(startAchievement)
    .controller('Achievement', Controller)
    .directive('reply', reply)
;

function startAchievement(router, config){
    var configRoute = {
        url: '/achievement/:achievementId',
        templateUrl: '/assets/templates/achievement.html',
        controller: 'Achievement as achievement'
    };

    var configApp = {
        title: `Achievement | ${config.title}`,
        access: 'public'
    };

    router.setRoute('app.achievement', configRoute, configApp);
}

export default module;
