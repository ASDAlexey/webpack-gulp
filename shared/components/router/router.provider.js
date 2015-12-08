var routeProvider = function () {
    this.config = {};

    this.$get = function() {
        return {
            config: this.config
        };
    };
}

export default routeProvider;
