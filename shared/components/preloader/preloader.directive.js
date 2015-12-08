var directive = function($rootScope, $timeout, preloader){
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$on('preloader:updated', (event, data)=>{
                var name = attrs.preloader;

                if (name === data.name) {
                    if (preloader.shouldHideOverlay(name)) {
                        element.hide();

                        $timeout(()=>{
                            $rootScope.$broadcast('preloader:hide', { name: name });
                        }, 0);
                    } else {
                        if (!element.is(':visible')) {
                            element.show();

                            $timeout(()=>{
                                $rootScope.$broadcast('preloader:show', { name: name });
                            }, 0);
                        }
                    }
                }
            });
        }
    }
}

export default directive;