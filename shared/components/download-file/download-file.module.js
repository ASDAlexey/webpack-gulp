import factory from './download-file.factory.js';

var router = angular
    .module('downloadFile', [])
    .config(configure)
    .service('DownloadFile', factory)
;

function configure($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}

export default router;
