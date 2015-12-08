var filter = function(){
    return function(input){
        if (input) {
            if (/(www\.)/i.test(input)){
                input = input.replace(/(www\.)/i, "");
            }

            var matches = /\w+:\/\/([\w|\.]+)/.exec(input);

            if ( matches !== null ) input = matches[1];

            return input;
        }

        return '';
    };
}

export default filter;