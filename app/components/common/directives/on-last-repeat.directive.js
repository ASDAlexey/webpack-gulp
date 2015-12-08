var directive = function () {
    return function(scope, element, attrs) {
        if (scope.$last) {
            scope.$eval(attrs.onLastRepeat);
        }
    }
}

export default directive;
