import Controller from './user.controller.js';

var user = angular
    .module('app.user', [])
    .controller('User', Controller)
    .run(runModule);

//Notifacation if redirect to this page form fromState.nameapp=='app.settings' (from app.home to app.settings)
function runModule($rootScope, Notification, logger) {
    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams)=> {
        if (toState.name.indexOf('app.home') !== -1) {
            Notification.getNotifications({read: 0, unread: 1}).then((data)=> {
                if (data && data.length) {
                    angular.forEach(data, function (value, key) {
                        if(value.type == 'REWARD') {
                            logger.notification(value);
                            Notification.openNotification(value.id);
                        }
                    });
                }
            });
        }
    });
}

export default user;
