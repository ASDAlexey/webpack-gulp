import template from './settings.tmpl.html';
import accountTmpl from './account.tmpl.html';
import privacyTmpl from './privacy.tmpl.html';
import notificationTmpl from './notification.tmpl.html';
import referralTmpl from './referral.tmpl.html';

import styles from './assets/styles/settings.scss';
import Controller from './settings.controller.js';

var settings = angular
    .module('app.settings', [])
    .run(startSettings)
    .controller('Settings', Controller)
;

function startSettings(router, config){
    var configRoute = {
        url: '/settings',
        template: template,
        controller: 'Settings as settings',
    };

    var configPage = {
        title: `${config.title} - Settings`
    };

    router.setRoute('app.settings', configRoute, configPage);

    var configAccountRoute = {
        url: '/account',
        template: accountTmpl
    };

    router.setRoute('app.settings.account', configAccountRoute, { title: `${config.title} - Account` });

    var configPrivacyRoute = {
        url: '/privacy',
        template: privacyTmpl,
    };

    router.setRoute('app.settings.privacy', configPrivacyRoute, { title: `${config.title} - Privacy` });

    var configNotificationRoute = {
        url: '/notification',
        template: notificationTmpl
    };

    router.setRoute('app.settings.notification', configNotificationRoute, { title: `${config.title} - Notification` });

    var configReferralRoute = {
        url: '/referral',
        template: referralTmpl
    };

    router.setRoute('app.settings.referral', configReferralRoute, { title: `${config.title} - Referral` });

    router.setRedirect('app.settings', 'app.settings.account');
}

export default settings;
