var directive = function(){
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
              var onChangeHandler = scope.$eval(attrs.fileOnChange);

              element.bind('change', onChangeHandler);
        }
    }
}

export default directive;
