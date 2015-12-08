var directive = function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            scope.$watchCollection(function(){
                return scope.$eval(attrs.scrollBottom);
            }, function (newValue) {
                if (newValue) {
                    $(element).scrollTop($(element)[0].scrollHeight);
                }
            });
        }
    }
}

export default directive;