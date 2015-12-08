var directive = function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, controller){
            function ensureHttpPrefix(value) {
                if( value &&
                    !/^(http|https):\/\//i.test(value) &&
                    !value.match(/^(h$|ht$|htt$|http$|https$|http:$|http:\/$|http:\/\/$|https:$|https:\/$:https:\/\/$)/ig))
                {
                    controller.$setViewValue('http://' + value);
                    controller.$render();

                    return 'http://' + value;
                } else {
                    return value;
                }
            }

            controller.$formatters.push(ensureHttpPrefix);
            controller.$parsers.push(ensureHttpPrefix);
        }
    }
}

export default directive;