var filter = function(){
    return function(input, length) {
        while(String(input).length < length){
            input = '0' + input;
        }

        return input;
    }
};

export default filter;