var directive = function($timeout, $window){
    return {
        restrict: 'A',
        scope: {
            'action': '&onSizeChanged'
        },
        link: function(scope, element, attrs){
            var $element = $(element),
                cachedElementWidth,
                cachedElementHeight;

            cacheElementSize();
            $($window).on('resize', onWindowResize);

            function cacheElementSize() {
                cachedElementWidth = $element.outerWidth();
                cachedElementHeight = $element.outerHeight();
            }

            function onWindowResize() {
                var isSizeChanged = cachedElementWidth != $element.outerWidth() || cachedElementHeight != $element.outerHeight();

                if (isSizeChanged) {
                   cacheElementSize();

                   $timeout(function () {
                       scope.action({ sizes: { width: cachedElementWidth, height: cachedElementHeight } })
                   });
                }
           };
        }
    }
}

export default directive;
