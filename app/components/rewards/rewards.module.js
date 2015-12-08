import './assets/styles/rewards.scss';
import './assets/styles/timeline.scss';
import Controller from './rewards.controller.js';
import rewardsPopup from './directives/rewards-popup.directive.js';

var rewards = angular
    .module('app.rewards', [])
    .controller('RewardsCtrl', Controller)
    .directive('rewardsPopup', ()=> new rewardsPopup())
    .run(runModule);
function runModule(router, config) {
    var configModalRoute = {
        url: '/rewards/:id',
        views: {
            "@": {
                controller: 'RewardsCtrl as vm'
            }
        }
    };

    router.setRoute('app.rewards', configModalRoute);
}

export default rewards;