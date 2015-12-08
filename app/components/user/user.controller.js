/* global moment */
class Controller{
    constructor($scope, $timeout, Auth, User, Notification, Resource, logger){
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.API = User;
        this.Auth = Auth;
        this.Notification = Notification;
        this.Resource = Resource;
        this.logger = logger;

        this.model = null;
        this.isLoadData=false;
        this.years = {
            from: 0,
            to: 0
        };

        this.points = {
            from: 0,
            to: 0
        };

        this.couterOptions = {
            useEasing : true,
            useGrouping : true,
            separator : ',',
            decimal : '.',
            prefix : '+',
            suffix : ''
        };

        this.password = {
            current: '',
            new: '',
            confirm: ''
        };


        $scope.$watch('user.API.getCurrentUser()', (newValue, oldValue)=>{
            var oldWallet,
                newWallet,
                oldPoints,
                newPoints;

            this.model = angular.copy(newValue);

            if (this.model && this.model.id) {
                // start polling of notifications with default settings
                if (!this.Notification.isRunning()) {
                    this.Notification.startNotifications();
                }

                // set time period of education
                this.years.from = this.getYears(null, this.model.information.time_to);
                this.years.to = this.model.information.graduated ? this.getYears(this.model.information.time_from) : this.getYears(this.model.information.time_from, null, null, { 'years': 10 });

                // reset status of bookmarks to correct animate them on the homepage
                this.$timeout(()=>{
                    angular.forEach(this.model.bookmarks, function(bookmark, key) {
                        bookmark.isLoaded = false;
                    });
                }, 500);
            } else {
                // stop polling
                this.Notification.stopNotifications();

                // set time period of education with default values
                this.years.from = this.getYears();
                this.years.to = this.getYears(null, null, null, { 'years': 10 });
            }

            // animate jelly points
            if (angular.isObject(newValue) && angular.isObject(oldValue)) {
                oldWallet = _.findWhere(oldValue.wallets, { type: 'JELLY' });
                oldPoints = oldWallet ? oldWallet.value : this.getJellyPoints();
                newWallet = _.findWhere(newValue.wallets, { type: 'JELLY' });
                newPoints = newWallet ? newWallet.value : this.getJellyPoints();

                if (newPoints !== oldPoints) this.animatePoints(oldPoints, newPoints);
            } else {
                this.animatePoints();
            }
        });

        $scope.$watch('user.model.avatar', (newValue, oldValue)=>{
            if(angular.isObject(newValue) && newValue.hasOwnProperty('file')){
                this.lastLoadedAvatar = this.model.avatar.path;
            }
        });

    }

    changePassword(){
        this.API.changePassword(this.password.current, this.password.new, this.password.confirm).then((response)=>{
            this.password = {
                current: '',
                new: '',
                confirm: ''
            }
        });
    }

    animatePoints(pointsFrom, pointsTo){
        this.points.from = pointsFrom || this.getJellyPoints();
        this.points.to = pointsTo || this.getJellyPoints();
        this.$timeout(()=>{
            this.$scope.$digest();
        });
    }

    animationPointsCompleted(){
        this.points.from = this.getJellyPoints();
        this.points.to = this.getJellyPoints();
    }

    updatePoints(points){
        this.animatePoints(this.points.from, this.points.from + points);
    }

    getYears(minYear, maxYear, addMinTime, addMaxTime){
        var years = [],
            min = moment(minYear || '1900-01-01'),
            max = moment(maxYear || new Date());

        if (angular.isObject(addMinTime)) min.add(moment.duration(addMinTime));
        if (angular.isObject(addMaxTime)) max.add(moment.duration(addMaxTime));

        for (let i= max.years(); i >= min.years(); i--){
            // convert to string to correctly compare with a received value from server
            years.push(i.toString());
        }

        return years;
    }

    updateCountry(){
        this.model.information.state = null;
        this.model.information.city = null;

        this.updateUser();
    }

    updateState(){
        this.model.information.city = null;

        this.updateUser();
    }

    removeAvatar(avatar){
        this.model.avatar='';
        this.updateAvatar();
        this.lastLoadedAvatar=null;
    }

    updateUser(){
        this.isLoadData = true;
        this.API.updateUser(this.model).then((user)=>{
            // logic of updating model will be handled into function $watch of constructor
        }, (user, message)=>{
            this.model = user;
            this.years.from = this.getYears(null, this.model.information.time_to);
            this.years.to = this.model.information.graduated ? this.getYears(this.model.information.time_from) : this.getYears(this.model.information.time_from, null, null, { 'years': 10 });
        }).finally(()=>{
            this.$timeout(()=> {
                this.isLoadData = false;
            }, 1500);
        });
    }

    updateAvatar(){
        this.API.updateAvatar(this.model.avatar).then((user)=>{
            this.model = user;
            this.errors=null;
        }, (err)=>{
            this.errors=err;
        });
    }

    updateUserViaQueue(){
        this.API.updateUserViaQueue(this.model).then((user)=>{
            // logic of updating model will be handled into function $watch of constructor
        }, (user, message)=>{
            this.model = user;
            this.years.from = this.getYears(null, this.model.information.time_to);
            this.years.to = this.model.information.graduated ? this.getYears(this.model.information.time_from) : this.getYears(this.model.information.time_from, null, null, { 'years': 10 });
        });
    }

    getJellyWallet(){
        return this.model && this.model.wallets ? _.findWhere(this.model.wallets, {type: 'JELLY'}) : { value: 0 };
    }

    getSurveyWallet(){
        return this.model && this.model.wallets ? _.findWhere(this.model.wallets, {type: 'SURVEY'}) : { value: 0 };
    }

    getJellyPoints(){
        return this.getJellyWallet().value;
    }

    getSurveyPoints(){
        return this.getSurveyWallet().value;
    }

    userHasTimezone(){
        return this.model && this.model.information.city && this.model.information.city.timezone;
    }

    getUserTimezone(){
        return this.userHasTimezone() ? this.model.information.city.timezone : false;
    }
}

export default Controller;
