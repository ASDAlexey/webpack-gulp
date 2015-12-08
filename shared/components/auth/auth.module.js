import auth from './auth.factory.js';
import styles from './assets/styles/auth.scss';
import Modal from './auth-modal.controller.js';

var module = angular
    .module('auth', [])
    .factory('Auth', auth)
    .controller('AuthModal', Modal)
    .run(startModule)
;

function startModule($rootScope, $modalStack, router, Auth){
    var configLoginRoute = {
        url: '/login',
        resolve: {
            previousState: function($injector){
                var $state = $injector.get('$state');

                return {
                    name: $state.current.name,
                    params: $state.params,
                    url: $state.href($state.current.name, $state.params)
                };
            }
        },
        controller: function($injector, previousState, Auth){
            var $state = $injector.get('$state');

            Auth.showLoginPopup(true).result.then(()=>{
                if (previousState.name) {
                    $state.go(previousState.name, previousState.params);
                } else {
                    $state.go('app.home');
                }
            });
        }
    };

    var configLogoutRoute = {
        url: '/logout',
        controller: function(Auth){
            Auth.logout();
        }
    };

    router.setRoute('logout', configLogoutRoute);
    router.setRoute('login', configLoginRoute, { access: 'public' });

    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams)=>{
        $modalStack.dismissAll();

        if (toState.name !== 'login') {
            // check access of user, this is asynchronous operation, if this is success then  current route will be reload
            Auth.checkAccess(event, toState, toParams, fromState, fromParams);
        }
        
        // set config of current state
        $rootScope.page = router.configs[toState.name];
    });
}

export default module;
