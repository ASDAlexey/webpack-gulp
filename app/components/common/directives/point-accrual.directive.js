var directive = function(){
    return {
        restrict: 'A',
        scope: {
            pointValue: "@",
            pointCallback: "&"
        },
        link: function(scope, element, attrs){
            var points = attrs.pointValue;

            $(element).on('click', function(event){
                event.preventDefault();

                var $element = $(event.target).closest('[point-accrual]'),
                    topPos = $element.offset().top - $(window).scrollTop(),
                    leftPos = $element.offset().left + 50 - $(window).scrollLeft();

                $element.parent().append(`<span class="chip-points">+${points}</span>`);

                var $point = $('.chip-points').last();

                $point.css({
                    position: "fixed",
                    top: topPos,
                    left: leftPos,
                    color: "#A0D468",
                    fontSize: "46px",
                    lineHeight: "46px",
                    fontWeight: "bold",
                    opacity: "0",
                    zIndex: "9999999"
                });

                $point.animate({
                    opacity: "1",
                    top: topPos - 120,
                }, 1500, function(){
                    scope.pointCallback();
                    $point.remove();
                });
            });
        }
    }
}

export default directive;