class Router {
    constructor($rootScope, $injector, $window, $q, routerConfig, User, preloader){
        this.routes = [];
        this.$stateProvider = routerConfig.config.$stateProvider;
        this.$q = $q;
        this.$urlRouterProvider = routerConfig.config.$urlRouterProvider;
        this.$locationProvider = routerConfig.config.$locationProvider;
        this.$rootScope = $rootScope;
        this.$injector = $injector;
        this.$window = $window;
        this.User = User;
        this.preloader = preloader;
        this.configs = [];
        this.redirects = [];
        this.baseUrl = '/';
        this.breadcrumbs = [];
    }

    setRoute( nameState, configState, configPage = {} ){
        this.routes.push({
            'name': nameState,
            'config': configState
        });

        this.configs[nameState] = configPage;

        if (angular.isDefined(configPage.breadcrumbs) && angular.isDefined(configPage.breadcrumbs.crumbTitle)) {
            this.breadcrumbs[nameState] = {
                'route': nameState,
                'title': configPage.breadcrumbs.crumbTitle,
                'isFirstCrumb': !!configPage.breadcrumbs.isFirstCrumb,
                'shouldShowFirstCrumb': !!configPage.breadcrumbs.shouldShowFirstCrumb
            };
        }
    }

    configureRoutes(){
        this.routes.forEach((route)=>{
            this.$stateProvider.state(route.name, route.config);
        });

        this.$urlRouterProvider.otherwise(this.baseUrl);

        this.$locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        }).hashPrefix('!');

        var $state = this.$injector.get('$state');

        this.redirects.forEach((redirect)=>{
            this.$rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams)=>{
                if ( toState.name === redirect.from ) {
                    event.preventDefault();
                    $state.go(redirect.to, toParams);
                }
            });
        });
    }

    getStateByName(stateName){
        return _.find(this.routes, function(route){ return route.name === stateName }).config
    }

    setRedirect(fromStateName, toStateName){
        this.redirects.push({
            from: fromStateName,
            to: toStateName
        });
    }

    getBreadcrumbs(){
        var $state = this.$injector.get('$state'),
            currentState = $state.$current,
            breadcrumbs = this.breadcrumbs,
            stateBreadcrumbs = [],
            hasFirstCrumb = false,
            currentCrumb = this.breadcrumbs[currentState.name];

        while(currentState && currentState.name !== ''){
            let crumb = this.breadcrumbs[currentState.name];

            if (crumb) {
                stateBreadcrumbs.push(crumb);

                if (crumb.isFirstCrumb) {
                    hasFirstCrumb = true;
                }
            };

            currentState = currentState.parent;
        }

        if (currentCrumb.shouldShowFirstCrumb) {
            if (hasFirstCrumb) return;

            for (let crumb in breadcrumbs){
                let c = breadcrumbs[crumb];

                if (c.isFirstCrumb) {
                    stateBreadcrumbs.push(c);
                }
            }
        }

        return stateBreadcrumbs.reverse();
    }

    getTypeOfAccess(toStateName){
        var access;

        if (this.configs[toStateName].access) return this.configs[toStateName].access;

        var segments = toStateName.split('.');

        for (let i = segments.length - 1; i >= 0 && !access; i--) {
            let route = _.filter(segments, function(segment, index){ return index <= i }).join('.');

            if (this.configs[route].access){
                access = this.configs[route].access;
            }
        }

        return access;
    }

    checkAccess(toState){
        var access = this.getTypeOfAccess(toState.name),
            deferred = this.$q.defer();

        if (!this.User.isLogged()){
            this.preloader.requestIsSent('main');

            this.User.checkAccess().then((user)=>{
                this.preloader.responseIsReceived('main');
                deferred.resolve();
            }, ()=>{
                if (access === 'public') {
                    this.preloader.responseIsReceived('main');
                    deferred.resolve();
                } else {
                    var routeConfig = this.configs[toState.name];

                    deferred.reject();

                    this.$window.location.href = routeConfig.redirect ? routeConfig.redirect : '/index.html';
                }
            });
        } else {
            deferred.resolve();
        }

        return deferred.promise;
    }
}

export default Router;
