var filter = function(){
    return function(input){
        return parseInt(input, 10);
    };
}

export default filter;