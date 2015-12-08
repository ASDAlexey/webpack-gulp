var directive = function($timeout, config){
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var $window = $(window);

            // add listeners to detect current modes of touch devices
            if (config.isMobile && config.isTouch) {
                $window.on("resize", ()=>{
                    $timeout(()=>{
                        config.isKeyboard = detectVirtualKeyboard();
                        config.isLandscape = (screen.height < screen.width);
                    });
                });

                $(document).on("focus", `
                    input[type="text"],
                    input[type="email"],
                    input[type="password"],
                    input[type="search"],
                    input[type="tel"],
                    input[type="url"],
                    textarea
                `, (event)=>{
                    $timeout(()=>{
                        config.isActiveInputElement = true;
                        config.isKeyboard = detectVirtualKeyboard();
                    });
                });

                $(document).on("blur", `
                    input[type="text"],
                    input[type="email"],
                    input[type="password"],
                    input[type="search"],
                    input[type="tel"],
                    input[type="url"],
                    textarea
                `, (event)=>{
                    $timeout(()=>{
                        config.isActiveInputElement = false;
                        config.isKeyboard = detectVirtualKeyboard();
                    });
                });

                function detectVirtualKeyboard(){
                    return config.isAndroid ? (screen.height < screen.width) && config.isActiveInputElement : config.isActiveInputElement;
                }
            }
        }
    }
}

export default directive;