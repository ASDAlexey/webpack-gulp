var directive = function($timeout){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            scope.$watch(attrs.showFocus, function (newValue) {
                if (newValue) {
                    $timeout(function() {
                        element.focus();
                    });
                };
            }, true);
        }
    }
}

export default directive;