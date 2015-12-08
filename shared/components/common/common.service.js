class Common {
    constructor($q, $timeout, $log, $window){
        // common angular dependencies
        this.$q = $q;
        this.$timeout = $timeout;
        this.$log = $log;
        this.$window = $window;
    }
}

export default Common;
