var directive = function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(attrs.dotdotdot, function (newValue, oldValue) {
                $(element).dotdotdot({ 'watch': true });
            });
        }
    }
}

export default directive;