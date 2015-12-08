var directive = function($timeout){
    return {
        restrict: 'A',
        scope: {
            animateAddClass: "@",
            animateRemoveClass: "@"
        },
        link: function(scope, element, attrs){
            element.addClass(attrs.animateRemoveClass).removeClass('_done');


            if (element.hasClass('_ready')){
                element.addClass(attrs.animateAddClass).removeClass(attrs.animateRemoveClass);
            } else {
                angular.element(document).ready(function(){
                    element.addClass('_ready').addClass(attrs.animateAddClass).removeClass(attrs.animateRemoveClass);
                });
            }
        }
    }
}

export default directive;