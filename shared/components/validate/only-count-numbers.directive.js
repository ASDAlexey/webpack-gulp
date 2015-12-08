class Directive {
    constructor() {
        //Directive settings
        this.restrict = 'A';
        this.link = (scope, element, attr, ctrls, transludeFn)=> {
            var t = '';
            scope.isRanged = false;

            var gText = function (e) {
                t = (document.all) ? document.selection.createRange().text : document.getSelection();
                if (t.type == 'Range')
                    scope.isRanged = true;
                else
                    scope.isRanged = false;
            };

            document.onmouseup = gText;
            if (!document.all) document.captureEvents(Event.MOUSEUP);

            element[0].addEventListener('keydown', (function (e) {
                let ect = e.currentTarget;
                console.log(scope.isRanged);
                if (!scope.isRanged) {
                    scope.isRanged = false;
                    if (ect.value.length <= parseInt(attr.onlyCountNumbers) - 1 || e.keyCode == 8 || e.keyCode==9) {
                        return true;
                    } else
                        e.preventDefault();
                } else {
                    scope.isRanged = false;
                    return true;
                }
            }));
        };
    }

    static factory() {
        var directive = () =>
            new Directive();
        return directive;
    }
}

export default Directive;