var module = angular
    .module('app.analystics', [])
    .run(runModule)
;

function runModule($injector, $rootScope, $window){
    $rootScope.$on('$stateChangeSuccess', function (event) {
        if (!$window.ga) return;

        // fix html5Mode error
        var $location = $injector.get('$location');

        $window.ga('send', 'pageview', { page: $location.url() });
    });
}

export default module;
