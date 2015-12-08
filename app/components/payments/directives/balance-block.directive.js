var directive = function(paymentModal){
    return {
        restrict: 'A',
        link: function(scope, element, attrs, controller){
            element.on('click', function(){
                var param = {cost: 0};

                if(attrs.buyResponses)
                    param = attrs.buyResponses;

                paymentModal.show(param);
            });
        }
    }
}

export default directive;