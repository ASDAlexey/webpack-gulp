var filter = function(){
    return function(input){
        switch(input) {
            case 'not_verified':
                return 'Not Verified';
                break;
            case 'verified':
                return 'Verified';
                break;
            case 'banned_not_verified':
                return 'Banned';
                break;
            case 'banned_verified':
                return 'Banned';
                break;
            default:
                return input;
        }
    };
}

export default filter;