var directive = function(config){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            if (config.isTouch) {
                var duration = 200,
                    startPosition;

                var mc = new Hammer.Manager(angular.element(element)[0], { domEvents: false });
                mc.add(  new Hammer.Pan({ threshold: 5, direction: Hammer.DIRECTION_VERTICAL }) );

                mc.on('panstart', function(event){
                    startPosition = element.position().top;;
                });

                mc.on('panmove swipe', function(event){
                    var top = element.position().top;

                    element.css('top', startPosition + event.deltaY);
                });

                mc.on('panend pancancel', function(event){
                    var top = element.position().top;

                    switch (event.direction) {
                        case Hammer.DIRECTION_UP:
                            var parent =  $(element).parent(),
                                elementHeight = $(element).outerHeight(),
                                minTop = $(window).height() - elementHeight - (parent.outerHeight() - elementHeight) - parent.position().top;

                            if (top < minTop) {
                                element.animate({ 'top': Math.min(minTop, 0) }, duration);
                            }

                            break;
                        case Hammer.DIRECTION_DOWN:
                            if (top > 0) {
                                element.animate({ 'top': 0 }, duration);
                            }

                            break;
                        default:
                            element.animate({ 'top': 0 }, duration);
                    }
                });
            }
        }
    }
}

export default directive;
