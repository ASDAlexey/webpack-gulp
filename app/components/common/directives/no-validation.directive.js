var directive = function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl){
            if (!attrs.type) retrun;

            var validators = {};

            angular.forEach(ctrl.$validators, (value, key)=>{
                validators[key] = function(){
                    return true;
                };
            });

            ctrl.$validators = validators;
        }
    }
}

export default directive;
