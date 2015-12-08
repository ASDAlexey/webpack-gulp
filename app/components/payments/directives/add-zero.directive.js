class Directive {
    constructor() {
        //Directive settings
        this.restrict = 'A';
        this.link = (scope, element, attr, ctrl)=> {
            let addNumbers = (e)=> {
                let value = e.currentTarget.value;
                if (e.type == 'blur') {
                    value = parseInt(value);
                    if (value >= 0 && value <= 9)
                        element[0].value = '0' + value;
                }
            };
            element[0].addEventListener('blur', addNumbers);
        };
    }

    static factory() {
        var directive = () =>
            new Directive();
        return directive;
    }
}
export default Directive;