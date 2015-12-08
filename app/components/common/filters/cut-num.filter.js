var filter = function(){
    return function(input, max, tail){
        if (!input) return '';

        max = parseInt(max, 10);
        input = parseInt(input, 10);

        if (input <= max) return input;

        return max + (tail || '+');
    };
}

export default filter;