import Service from './router.service.js';
import provider from './router.provider.js';
import locationDecorator from './location.decorator.js';

var router = angular
    .module('router', ['ui.router'])
    .provider('routerConfig', provider)
    .config(configure)
    .service('router', Service)
    .run(runModule)
;

function configure($provide){
    $provide.decorator('$location', locationDecorator);
}

function runModule($rootScope, router) {
    $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
        throw error;
    });

    $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams)=>{
        // set config of current state
        $rootScope.page = router.configs[toState.name];
    });
}

export default router;
