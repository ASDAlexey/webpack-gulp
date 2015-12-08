var directive = function($timeout){
    return {
        restrict: 'A',
        scope: {
            'action': '&onFocus'
        },
        link: function(scope, element, attrs){
            element.on('mousedown', function($event){
                $timeout(function () {
                    scope.$eval(scope.action);
                });
            });
        }
    }
}

export default directive;
