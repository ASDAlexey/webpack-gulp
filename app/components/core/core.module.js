// Shared components
import common from '../../../shared/components/common/common.module.js';
import router from '../../../shared/components/router/router.module.js';
import config from '../../../shared/components/config/config.module.js';
import dataservice from '../../../shared/components/dataservice/dataservice.module.js';
import modal from '../../../shared/components/modal/modal.module.js';
import preloader from '../../../shared/components/preloader/preloader.module.js';
import downloadFile from '../../../shared/components/download-file/download-file.module.js';
import timer from '../../../shared/components/timer/timer.module.js';
import auth from '../../../shared/components/auth/auth.module.js';
import validate from '../../../shared/components/validate/validate.module.js';

// Features components
import header from '../header/header.module.js';
import user from '../user/user.module.js';
import commonApp from '../common/common.module.js';
import home from '../home/home.module.js';
import surveys from '../surveys/surveys.module.js';
import store from '../store/store.module.js';
import profile from '../profile/profile.module.js';
import achievement from '../achievement/achievement.module.js';
import settings from '../settings/settings.module.js';
import editbox from '../editbox/editbox.module.js';
import logger from '../logger/logger.module.js';
import social from '../social/social.module.js';
import welcome from '../welcome/welcome.module.js';
import weather from '../weather/weather.module.js';
import chat from '../chat/chat.module.js';
import scrollbar from '../scrollbar/scrollbar.module.js';
import servertime from '../servertime/servertime.module.js';
import answers from '../answers/answers.module.js';
import payments from '../payments/payments.module.js';
import invoices from '../invoice/invoice.module.js';
import analystics from '../analystics/analystics.module.js';
import coupon from '../coupon/coupon.module.js';
import rewards from '../rewards/rewards.module.js';

var core = angular
    .module('app.core', [
        // Angular components
        'ngAnimate',
        'ngSanitize',

        // Shared components
        'router',
        'auth',
        'common',
        'config',
        'dataservice',
        'modal',
        'preloader',
        'downloadFile',
        'timer',
        'validate',

        // Features components
        //'app.header',
        //'app.rewards',
        'app.user',
        //'app.common',
        //'app.home',
        //'app.surveys',
        //'app.store',
        //'app.profile',
        //'app.achievement',
        //'app.settings',
        //'app.editbox',
        'app.logger',
        //'app.social',
        //'app.welcome',
        //'app.weather',
        //'app.chat',
        //'app.scrollbar',
        //'app.servertime',
        //'app.answers',
        //'app.payments',
        //'app.invoice',
        //'app.analystics',
        //'app.coupon',

        // 3rd Party components
        'ui.router',
        'ui.bootstrap',
        'ui.router.tabs',
        'wu.masonry',
        'ngDragDrop',
        'relativeDate',
        'toaster',
        'angular.filter',
        'ng-fastclick'
    ])
    .run(startApp)
;

function startApp($animate, router){
    var configRoute = {
        url: '',
        abstract: true,
        template: '<ui-view></ui-view>'
    };

    var configPage = {
        access: 'private'
    };

    router.setRoute('app', configRoute, configPage);

    router.configureRoutes();

    // disable animation for body element
    // $animate.enabled(false, angular.element('body'));
}

export default core;
