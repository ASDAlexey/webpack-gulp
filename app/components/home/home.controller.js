class Home {
    constructor($window, $timeout, $scope, Survey, Chat, Friend, Timer, preloader){
        this.$scope = $scope;
        this.$window = $window;
        this.$timeout = $timeout;
        this.preloader = preloader;
        this.Survey = Survey;
        this.Chat = Chat;
        this.Friend = Friend;
        this.Timer = Timer;
        this.subscriptions = [];
        this.isShowMode = false;
        this.bookmarks = null;
        this.isLoaded = false;
        this.isContentLoaded = false;
        this.isPreloaderDisplayed = false;
        this.unreadedMessages = 0;
        this.inFriends = 0;

        this.shouldShowChat = false;
        this.shouldShowWeather = false;
        this.shouldShowSurvey = false;

        this.currentSurvey = null;
        this.surveysLimit = 4;
        this.sortIndexes = [];

        this.getMySubscription();
        this.getMyFriends();

        this.subscriptionInterval = this.Timer.addInterval(()=>{
            this.getMySubscription(false);
        }, 10 * 1000);

        this.friendsInterval = this.Timer.addInterval(()=>{
            this.getMyFriends();
        }, 60 * 1000);

        this.$scope.$on('$destroy', ()=>{
            if (this.subscriptionInterval) {
                this.Timer.cancelInterval(this.subscriptionInterval);
                this.subscriptionInterval = undefined;
            }

            if (this.friendsInterval) {
                this.Timer.cancelInterval(this.friendsInterval);
                this.friendsInterval = undefined;
            }
        });

        this.$scope.$on('$viewContentLoaded', ()=>{
            this.isContentLoaded = true;

            this.checkDomLoaded();
        });

        this.$scope.$on('preloader:hide', (data)=>{
            if (data.name === 'main') {
                this.isPreloaderDisplayed = false;

                this.checkDomLoaded();
            };
        });

        this.$scope.$on('preloader:show', (data)=>{
            if (data.name === 'main') {
                this.isPreloaderDisplayed = true;
            };
        });

        this.$scope.$watch('user.model.bookmarks', (newValue, oldValue)=> {
            this.bookmarks = this.$scope.user.model ? this.$scope.user.model.bookmarks : null;
            this.checkDomLoaded();
        });
    }


    getMyFriends(){
        this.Friend.getFriends().then((list)=>{
            this.inFriends = list.in.length;
        });
    }

    getMySubscription(flag = true){
        if (flag) this.preloader.requestIsSent('main');
        this.Survey.getMySubscription(this.surveysLimit).then((list) => {

            if (this.subscriptions.length) {
                var diff = [],
                    keysOfUndefindeds = [];

                _.each(list, (value, key)=>{
                    if (!_.findWhere(this.subscriptions, { id: value.id })){
                        diff.push(value);
                    }
                });

                _.each(this.subscriptions, (value, key)=>{
                    if (angular.isUndefined(value)){
                        if (diff.length){
                            this.subscriptions[key] = diff[0];
                            diff.splice(0, 1);
                        } else {
                            keysOfUndefindeds.push(key);
                        }
                    }
                });

                if(diff.length && (this.subscriptions.length < this.surveysLimit)){
                    _.each(diff, (value, key)=>{
                        this.subscriptions.push(diff[0]);
                        diff.splice(key, 1);
                    })
                }

                _.each(keysOfUndefindeds, (value)=>{
                    this.subscriptions.splice(value, 1);
                });

                // remove finished surveys
                _.each(this.subscriptions, (value, key)=>{
                    if (!angular.isUndefined(value)){
                        if (!_.findWhere(list, { id: value.id })){
                            this.subscriptions.splice(key, 1);
                        }
                    }
                });
            } else {
                this.subscriptions = list;

                _.each(this.subscriptions, (value, key)=>{
                    this.sortIndexes.push({
                        id: value.id,
                        pos: key
                    });
                });
            }

            if (flag) this.checkDomLoaded();
        }).finally(()=>{
            if (flag) this.preloader.responseIsReceived('main');
        });
    }

    closeModalWindows(){
        this.shouldShowChat = false;
        this.shouldShowWeather = false;
        this.shouldShowSurvey = false;
    }

    completeSurvey(){
        this.closeModalWindows();

        var subscription,
            index;

        _.each(this.subscriptions, (item, key)=> {
            if (this.currentSurvey.id === item.survey.id) {
                subscription = item;
                index = key;
            }
        });

        if (angular.isObject(subscription)) {
            subscription.status = 'COMPLETED';

            this.Timer.cancelInterval(this.subscriptionInterval);

            // add timeout to complete animations of chips
            this.$timeout(()=>{
                delete this.subscriptions[index];
                this.getMySubscription(false);

                this.subscriptionInterval = this.Timer.addInterval(()=>{
                    this.getMySubscription(false);
                }, 10 * 1000);
            }, 400);
        } else {
            this.getMySubscription(false);
        }
    }

    checkDomLoaded(){
        if (this.isContentLoaded && !this.isPreloaderDisplayed && !!this.bookmarks) {
            this.$timeout(()=>{
                this.isLoaded = true;
            }, 1);
        }
    }

    isNotEmptyBookmarks(bookmark) {
        return !!(bookmark && bookmark.link && bookmark.link !== '');
    }

    toggleBookmarksVisibility(){
        this.isShowMode = !this.isShowMode;
    }

    toggleSurvey(subscription){
        if (subscription && (subscription.status === 'ACTIVE' || subscription.status === 'NEW')) {
            this.shouldShowSurvey = !this.shouldShowSurvey;

            this.currentSurvey = this.shouldShowSurvey ? subscription.survey : null;
        }
    }

    clickBookmark($event, bookmark){
        $event.preventDefault();

        if (!this.isShowMode){
            this.$window.open(bookmark.link, '_blank');
        }
    }
}

export default Home;
