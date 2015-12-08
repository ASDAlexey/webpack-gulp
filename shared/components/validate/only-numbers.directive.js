class Directive {
    constructor() {
        //Directive settings
        this.restrict = 'A';
        this.link = (scope, element, attrs, ctrls, transludeFn)=> {
            element[0].addEventListener('keydown', ((event)=> {
                    if (event.keyCode === 46 || event.keyCode === 8 || event.keyCode === 9 || event.keyCode === 27 || (event.keyCode === 65 && event.ctrlKey === true) || (event.keyCode >= 35 && event.keyCode <= 39)) {
                        return;
                    } else {
                        if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                            event.preventDefault();
                        }
                    }
                })
            );
        };
    }

    static factory() {
        var directive = () =>
            new Directive();
        return directive;
    }
}

export default Directive;