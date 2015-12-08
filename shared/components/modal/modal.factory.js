var modal = function($rootScope, $modal, $state, $location, router){
    this.stateNameFrom = '';
    this.stateNameTo = '';
    this.fromParams;
    this.fromState;
    this.modalOptions = {};
    this.destroyHandler;

    function modalWindow(stateNameFrom, stateNameTo, modalOptions) {
        this.stateNameFrom = stateNameFrom;
        this.stateNameTo = stateNameTo;
        this.modalOptions = modalOptions;

        this.destroyHandler = $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams)=>{
            if (fromState.name === this.stateNameFrom && toState.name === this.stateNameTo) {
                event.preventDefault();

                this.modalOptions.controller = toState.controller || toState.views['@'].controller;
                this.modalOptions.templateUrl = toState.templateUrl || toState.views['@'].templateUrl;

                router.checkAccess(toState).then(()=>{
                    $state.current = toState;
                    $state.params = toParams;

                    this.fromParams = fromParams;
                    this.fromState = fromState;

                    $rootScope.page = router.configs[this.stateNameTo];

                    this.openModal();

                    $location.skipReload().path($state.href(toState, toParams)).replace();
                });
            }
        });
    }

    modalWindow.prototype.destroyModal = function() {
        this.destroyHandler();
    }

    modalWindow.prototype.openModal = function() {
        $modal
            .open(this.modalOptions)
            .result.finally(() => {
                if (!$state.transition){
                    $state.current = this.fromState;
                    $state.params = this.fromParams;

                    $rootScope.page = router.configs[this.stateNameFrom];

                    $location.skipReload().path($state.href(this.fromState, this.fromParams)).replace();
                }
            });
    }

    return modalWindow;
}

export default modal;
