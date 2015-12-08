import styles from './assets/styles/common.scss';

import scrollToCenter from './directives/scroll-to-center.directive.js';
import animateWhenReady from './directives/animate-when-ready.directive.js';
import pointAccrual from './directives/point-accrual.directive.js';
import clickAnywhereButHere from './directives/click-anywhere-but-here.directive.js';
import dateSelect from './directives/date-select.directive.js';
import httpPrefix from './directives/http-prefix.directive.js';
import countUp from './directives/count-up.directive.js';
import dotdotdot from './directives/dotdotdot.directive.js';
import onLastRepeat from './directives/on-last-repeat.directive.js';
import scrollBottom from './directives/scroll-bottom.directive.js';
import scrollTop from './directives/scroll-top.directive.js';
import showFocus from './directives/show-focus.directive.js';
import fileOnChange from './directives/file-on-change.directive.js';
import noValidation from './directives/no-validation.directive.js';
import textfill from './directives/textfill.directive.js';
import swipeMenu from './directives/swipe-menu.directive.js';
import onFocus from './directives/on-focus.directive.js';
import onSizeChanged from './directives/on-size-changed.directive.js';
import fixedElement from './directives/fixed-element.directive.js';

import domain from './filters/domain.filter.js';
import capitalize from './filters/capitalize.filter.js';
import num from './filters/num.filter.js';
import cutNum from './filters/cut-num.filter.js';
import userStatus from './filters/user.status.filter.js';

var common = angular
    .module('app.common', [])

    .directive('scrollToCenter', scrollToCenter)
    .directive('animateWhenReady', animateWhenReady)
    .directive('pointAccrual', pointAccrual)
    .directive('clickAnywhereButHere', clickAnywhereButHere)
    .directive('dateSelect', dateSelect)
    .directive('httpPrefix', httpPrefix)
    .directive('countUp', countUp)
    .directive('dotdotdot', dotdotdot)
    .directive('onLastRepeat', onLastRepeat)
    .directive('scrollBottom', scrollBottom)
    .directive('scrollTop', scrollTop)
    .directive('showFocus', showFocus)
    .directive('fileOnChange', fileOnChange)
    .directive('noValidation', noValidation)
    .directive('textfill', textfill)
    .directive('swipeMenu', swipeMenu)
    .directive('onFocus', onFocus)
    .directive('onSizeChanged', onSizeChanged)
    .directive('fixedElement', fixedElement)

    .filter('domain', domain)
    .filter('capitalize', capitalize)
    .filter('num', num)
    .filter('cutNum', cutNum)
    .filter('userStatus', userStatus)
;

export default common;
