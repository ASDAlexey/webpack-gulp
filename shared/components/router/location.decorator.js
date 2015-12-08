// Preventing state reload on URL change
// https://github.com/angular-ui/ui-router/issues/427#issuecomment-33294859
// can be used as $location.skipReload().path('/new/path').replace();
export default function locationDecorator($delegate, $rootScope){
    var skipping = false;

    $rootScope.$on('$locationChangeSuccess', function(event) {
        if (skipping) {
            event.preventDefault();
            skipping = false;
        }
    });

    $delegate.skipReload = function() {
        skipping = true;

        return this;
    };

    return $delegate;
}