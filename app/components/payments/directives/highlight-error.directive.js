class Directive {
    constructor(stripe) {
        //Directive settings
        this.restrict = 'A';
        this.require = 'ngModel';
        this.scope = {
            highlightError: "=",
            value: "=",
            inputName: "@",
            year: "=",
            month: "="
        };

        this.link = (scope, element, attrs, ctrl)=> {
            let isValide = (value, inputName)=> {
                let intVal = parseInt(value);
                if (inputName == 'month') {
                    if ((parseInt(scope.year) > new Date().getYear() - 100) || !parseInt(scope.year)) {
                        if (intVal >= 1 && intVal <= 12) {
                            return true;
                        }
                        else
                            return false;
                    } else {
                        if (intVal >= new Date().getMonth() && intVal <= 12) {
                            return true;
                        }
                        else
                            return false;
                    }
                } else if (inputName == 'year') {
                    let lastTwoD = new Date().getYear() - 100;
                    if (lastTwoD == intVal) {
                        if (scope.month >= new Date().getMonth()) {
                            if (intVal >= lastTwoD && intVal <= 99) {
                                return true;
                            } else
                                return false;
                        }
                    } else {
                        if (intVal >= lastTwoD && intVal <= 99) {
                            return true;
                        } else
                            return false;
                    }
                }
            };
            ctrl.$parsers.unshift(function (value) {
                if (value) {
                    if (isValide(value, scope.inputName)) {
                        ctrl.$setValidity('highlight-error', true);
                    }
                    else {
                        ctrl.$setValidity('highlight-error', false);
                    }
                    return value;
                }
            });
        };
    }

    static factory() {
        var directive = () =>
            new Directive();
        return directive;
    }
}
export default Directive;