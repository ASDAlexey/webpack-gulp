/* global __CONFIG__ */
var app = {
    isMobile: (function() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? true : false;
    })(),
    isTouch: (function(){
        return (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) ? true : false;
    })(),
    isIE: (function() {
        var ua = window.navigator.userAgent,
            msie = ua.indexOf("MSIE ");

        return (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) ? true : false;
    })(),
    isAndroid: (function() {
        return /Android/i.test(navigator.userAgent);
    })(),
    isiOS: (function() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    })(),
    isKeyboard: false,
    isLandscape: false,
    isActiveInputElement: false
};

// set options passed from ./webpack.config.js
var config = angular.extend(app, __CONFIG__);

export default config;
