import template from './profile.tmpl.html';
import styles from './assets/styles/profile.scss';
import ProfileController from './profile.controller.js';

var profile = angular
    .module('app.profile', [])
    .run(startProfile)
    .controller('Profile', ProfileController)
;

function startProfile(router, config){
    var configRoute = {
        url: '/profile/:userId',
        abstract: true,
        template: template,
        controller: 'Profile as profile'
    };

    var configRouteActivity = {
        url: '/activity',
        templateUrl: '/assets/templates/activity.html'
    };

    var configRouteFriends = {
        url: '/friends',
        templateUrl: '/assets/templates/friends.html'
    };

    router.setRoute('app.profile', configRoute, { access: 'public', theme: 'white' });
    router.setRoute('app.profile.activity', configRouteActivity, { title: `Profile | ${config.title}`, theme: 'white' });
    router.setRoute('app.profile.friends', configRouteFriends, { title: `Profile | ${config.title}`, theme: 'white' });

    router.setRedirect('app.profile', 'app.profile.activity');
}

export default profile;
