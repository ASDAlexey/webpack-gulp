var directive = function(){
    return {
        restrict: 'A',
        scope: {
            scrollTo: "@"
        },
        link: function(scope, $elm, attr){
            var $target = $(attr.scrollTo),
                $element = $($elm);

            $element.scrollLeft(($target.width() / 2) -  $element.width() / 2);
            $element.scrollTop(($target.height() / 2) -  $element.height() / 2);
        }
    }
}

export default directive;