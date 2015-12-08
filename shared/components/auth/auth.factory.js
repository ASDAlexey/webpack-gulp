import loginTmpl from './assets/templates/auth-login.html';
import recoveryTmpl from './assets/templates/auth-recovery.html';
import signupTmpl from './assets/templates/auth-signup.html';

var factory = function($rootScope, $injector, $window, $modal, $modalStack, router, User) {
    var lastStateName,
        locationSearch,
        locationHash;

    var service = {
        checkAccess: checkAccess,
        hasPermissionToEdit: hasPermissionToEdit,
        showLoginPopup: showLoginPopup,
        showSignUpPopup: showSignUpPopup,
        showRecoveryPopup: showRecoveryPopup,
        logout: logout,
        isLogged: isLogged
    };

    return service;
    /////////////////////

    function checkAccess(event, toState, toParams, fromState, fromParams) {
        if (toState.name !== lastStateName && !isLogged()) {
            event.preventDefault();
            var $location = $injector.get('$location');

            lastStateName = toState.name;

            // save data of location so we can add it back after transition is done
            locationSearch = $location.search();
            locationHash = $location.hash();

            router.checkAccess(toState).then(()=>{
                let $state = $injector.get('$state');

                $state.go(toState.name, toParams, { notify: false }).then(()=>{
                    // restore terms to url
                    if (locationHash) $location.skipReload().hash(locationHash);
                    if (locationSearch) $location.search(locationSearch);

                    $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
                });
            });
        }
    }

    function hasPermissionToEdit(userId){
        return isLogged() && User.getCurrentUser().id === parseInt(userId, 10);
    }

    function showLoginPopup(dismissStack = true) {
        if (dismissStack) $modalStack.dismissAll();

        var modalInstance = $modal.open({
            template: loginTmpl,
            controller: 'AuthModal',
            controllerAs: 'auth',
            windowClass: 'auth-modal'
        });

        modalInstance.result.then((isNewUser)=>{
            if (!!isNewUser) {
                var $state = $injector.get('$state');

                $state.go('app.welcome');
            }

            $rootScope.$broadcast('auth:login');
        });

        return modalInstance;
    }

    function showSignUpPopup(dismissStack = true) {
        if (dismissStack) $modalStack.dismissAll();

        var modalInstance = $modal.open({
            template: signupTmpl,
            controller: 'AuthModal',
            controllerAs: 'auth',
            windowClass: 'auth-modal'
        });

        modalInstance.result.then((isNewUser)=>{
            if (!!isNewUser) {
                var $state = $injector.get('$state');

                $state.go('app.welcome');
            }

            $rootScope.$broadcast('auth:signin');
        });

        return modalInstance;
    }

    function showRecoveryPopup(dismissStack = true) {
        if (dismissStack) $modalStack.dismissAll();

        var modalInstance = $modal.open({
            template: recoveryTmpl,
            controller: 'AuthModal',
            controllerAs: 'auth',
            windowClass: 'auth-modal'
        });

        return modalInstance;
    }

    function logout() {
        User.logout().then(()=>{
            var $state = $injector.get('$state');

            if (router.getTypeOfAccess($state.current.name) === 'private'){
                var routeConfig = router.configs[$state.current.name];

                $window.location.href = routeConfig.redirect ? routeConfig.redirect : '/index.html';
            } else {
                $state.reload();
            }

            $rootScope.$broadcast('auth:logout');
        });
    }

    function isLogged() {
        return User.isLogged();
    }
}

export default factory;
