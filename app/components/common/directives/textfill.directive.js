var directive = function(){
    return {
        restrict: 'A',
        scope: {
            textfill: '@',
            textfillOnSuccess: '=',
            textfillOnFail: '=',
            textfillOnComplete: '='
        },
        template: '<span>{{textfill}}</span>',
        link: function (scope, element, attr) {
            var options = {
                innerTag: attr.innerTag || "span",
                debug: attr.debug || false,
                minFontPixels: parseInt(attr.minFontPixels) || 4,
                maxFontPixels: parseInt(attr.maxFontPixels) || 40,
                widthOnly: attr.widthOnly || false,
                explicitHeight: attr.explicitHeight || null,
                explicitWidth: attr.explicitWidth || null,
                changeLineHeight: attr.changeLineHeight || false,
                success: scope.textfillOnSuccess || null,
                fail: scope.textfillOnFail || null,
                complete: scope.textfillOnComplete || null
            };

            element.textfill(options);

            scope.$watch('textfill', function () {
                element.textfill(options);
            });
        }
    };
}

export default directive;
