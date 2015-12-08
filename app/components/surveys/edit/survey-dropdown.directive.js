var directive = function(){
    return {
        restrict: "E",
        templateUrl: function(elem, attrs){
            return attrs.surveyDropdownTmpl;
        },
        scope: {
            list: "=",
            selected: "=",
            property: "@"
        },
        link: function(scope, elem, attrs) {
            scope.listVisible = false;
            scope.placeholder = attrs.placeholder || angular.element(elem).find('.dd-list-item').first().text();

            scope.selectItem = function(item) {
                scope.selected = item;
            };

            scope.selectText = function($event) {
                scope.selected = angular.element($event.currentTarget).find('span').first().text();
            };

            scope.show = function() {
                scope.listVisible = true;
            };

            scope.$watch("selected", function(value) {
                if ( value ) {
                    if (angular.isObject(scope.selected) && scope.property !== undefined) {
                        scope.placeholder = scope.selected[scope.property];
                    } else {
                        scope.placeholder = scope.selected;
                    }
                }
            });
        }
    }
}

export default directive;
