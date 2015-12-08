var factory = function($document, $window, $timeout){
    var handlerClick = handlerClick();

    var service = {
        downloadCSV: downloadCSV
    };

    return service;
    /////////////////////

    function handlerClick() {
        return {
            on: function(element) {
                var e = document.createEvent("MouseEvent");
                e.initMouseEvent("click", false, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                element.dispatchEvent(e);
            }
        };
    }

    function downloadCSV(title, content) {
        var blob = new Blob([content],  { type: 'text/csv' });
        var filename = `${title}.csv`;

        if (angular.isDefined($window.navigator.msSaveBlob)) {
            // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
            $window.navigator.msSaveBlob(blob, filename);
        } else {
            var URL = $window.URL || $window.webkitURL;
            var downloadUrl = URL.createObjectURL(blob);

            if (filename) {
                // use HTML5 a[download] attribute to specify filename
                var a = angular.element('<a></a>')[0];

                // safari doesn't support this yet
                if (angular.isUndefined(a.download)) {
                    $window.location = downloadUrl;
                } else {
                    a.href = downloadUrl;
                    a.download = filename;
                    $document[0].body.appendChild(a);
                    handlerClick.on(a);
                }
            } else {
                $window.location = downloadUrl;
            }

            // cleanup
            $timeout(function () {
                URL.revokeObjectURL(downloadUrl);
            }, 100);
        }
    }
}

export default factory;
