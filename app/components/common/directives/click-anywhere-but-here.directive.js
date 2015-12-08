var directive = function($document){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){

            var ignorePopup = attrs.hasOwnProperty('ignoreAnyPopup') ? true : false;

            var docClickHandler = function(event) {

                if (!element[0].contains(event.target) && !ignorePopup) {
                    scope.$apply(attrs.clickAnywhereButHere);
                }

                if(ignorePopup && !element[0].contains(event.target) && !$(event.target).parents().find('div.modal-dialog').length){
                    scope.$apply(attrs.clickAnywhereButHere);
                }
            };

            $document.on('click', docClickHandler);

            scope.$on('$destroy', function(){
                $document.off('click', docClickHandler);
            });
        }
    }
}

export default directive;
