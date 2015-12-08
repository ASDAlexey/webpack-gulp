var directive = function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            scope.$watchCollection(function(){
                return scope.$eval(attrs.scrollTop);
            }, function (newValue) {
                if (newValue) {
                    $(element).scrollTop(0);
                }
            });
        }
    }
}

export default directive;
