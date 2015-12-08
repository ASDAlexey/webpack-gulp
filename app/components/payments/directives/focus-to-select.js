var directive = function($timeout){
    return {
        restrict: 'A',
        scope:{
            'focusToSelect':'@'
        },
        link: function(scope, element, attrs, controller){
            let open=function(elem) {
                $timeout(function(){
                    if (document.createEvent) {
                        var e = document.createEvent("MouseEvents");
                        e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        elem[0].dispatchEvent(e);
                    } else if (element.fireEvent) {
                        elem[0].fireEvent("onmousedown");
                    }
                },100);
            };
            let isMousedownTab=function(e){
                if (e.which == 9) {
                    open($(`#${scope.focusToSelect}`))
                }
            };
            $(element).on('keydown touchstart', isMousedownTab);
        }

    }
};

export default directive;