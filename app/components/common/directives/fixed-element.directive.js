var directive = function($document, $timeout, config){
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            // Fix mobile floating toolbar when input is focused
            if (config.isTouch || config.isMobile) {
                $document
                    .on('focus', `
                        textarea,
                        input[type="text"],
                        input[type="email"],
                        input[type="password"],
                        input[type="search"],
                        input[type="tel"],
                        input[type="url"],
                        select
                    `, function(e) {
                        $(element).css('position', 'absolute');
                    })
                    .on('blur', `
                        textarea,
                        input[type="text"],
                        input[type="email"],
                        input[type="password"],
                        input[type="search"],
                        input[type="tel"],
                        input[type="url"],
                        select
                    `, function(e) {
                        $(element).css('position', '');

                        // Fix iOS problems of displaying the fixed elements when a virtual keyboard was closed
                        // $timeout(function () {
                        //     $document.scrollTop($document.scrollTop());
                        // }, 1);
                    })
                ;
            }
        }
    }
}

export default directive;