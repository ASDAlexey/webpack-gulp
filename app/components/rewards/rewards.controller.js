class Rewards {
    constructor($state, $scope, $rootScope) {
        this.$state = $state;
        if(this.$state.params.id>0 && this.$state.params.id<31)
            $rootScope.notificationNumber = this.$state.params.id;
        else
            this.$state.go('app.rewards',{id:1});
    }
}

export default Rewards;
