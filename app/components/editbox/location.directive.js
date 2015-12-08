var directive = function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, controller){
            function setLocationValue(value){
                if (angular.isObject(value)) {
                    controller.$setViewValue(value.name || value.ascii);
                    controller.$render();

                    return value.name || value.ascii;
                } else {
                    return value;
                }
            }

            controller.$formatters.push(setLocationValue);
            controller.$parsers.push(setLocationValue);
        }
    }
}

export default directive;