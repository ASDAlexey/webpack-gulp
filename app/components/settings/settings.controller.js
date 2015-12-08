class Settings {
    constructor($scope, Welcome, User, Social, TYPES_OF_RELATIONSHIP){
        this.Welcome = Welcome;
        this.User = User;
        this.Social = Social;
        this.notifications = null;
        this.currentMapOfNotification = null;
        this.$scope = $scope;
        this.TYPES_OF_RELATIONSHIP = TYPES_OF_RELATIONSHIP;
        this.isDisabled = false;

        this.tabData = [
            {
                heading: 'Account',
                route: 'app.settings.account'
            },
            {
                heading: 'Privacy',
                route: 'app.settings.privacy'
            },
            // {
            //     heading: 'Friend Referral',
            //     route: 'app.settings.referral'
            // },
            //{
            //    heading: 'Notification',
            //    route: 'app.settings.notification'
            //}
        ];

        this.mapsOfNotifications = {
            'Set Jelly Experience': [
                'users_happy_birthday',
                'one_year_anniversary_for_users',
                'survey_threshold_email',
                'free_to_pro_offer',
                'survey_approved',
                'survey_complete',
                'at_7_days_inactive',
                'jellychip_product_updates',
                'company_achievements',
                'jellychip_birthday',
                'points_notification',
                'periodic_update',
                'public_holiday',
                'your_achievements',
                'world_crisis'
            ],
            'Semi-Set Jelly Experience': [
                'users_happy_birthday',
                'one_year_anniversary_for_users',
                'survey_threshold_email',
                'free_to_pro_offer',
                'survey_approved',
                'survey_complete',
                'at_7_days_inactive',
                'jellychip_product_updates',
                'periodic_update',
                'world_crisis'
            ],
            'No Jelly Experience': []
        };

        this.$scope.$watch('user.model.notification', (newValue, oldValue)=>{
            this.notifications = this.$scope.user.model ? this.$scope.user.model.notification : [];
            this.changeMapOfNotifications();
        });
    }

    importFromFacebook(){
        this.Social.importFromFacebook();
    }

    importFromLinkedIn(){
        this.Social.importFromLinkedIn();
    }

    changeNotifications(){
        if (this.currentMapOfNotification !== 'Custom'){
            _.each(this.notifications, (value, key)=>{
                this.notifications[key] = !!_.find(this.mapsOfNotifications[this.currentMapOfNotification], function(value){ return value === key; });
            });

            this.$scope.user.updateUserViaQueue();
        }
    }

    changeMapOfNotifications(){
        var fits = [],
            current = '',
            arrayTrue = [];

        _.each(this.notifications, function(value, key){
            if (value){
                arrayTrue.push(key);
            }
        });

        _.each(this.mapsOfNotifications, function(mapValue, mapKey){
            if (mapValue.length !== arrayTrue.length) return;

            if (mapValue.length === 0){
                current = mapKey;
                return;
            }

            var i = 0;
            _.each(mapValue, function(value){
                if (!_.include(arrayTrue, value)) return;

                if (++i === mapValue.length) current = mapKey;
            });
        });

        if (current){
            this.currentMapOfNotification = current;
        } else {
            this.currentMapOfNotification = 'Custom';
        }
    }

    updateWelcomeTour(value){
        this.Welcome.updateShowValue(value).then((data)=>{
            this.User.setCurrentUser(data);
        });
    }

    resendVerifyEmail(){

        this.isDisabled = true;

        this.User.resendVerifyEmail().then((data)=>{

        }).finally(()=>{
            this.isDisabled = false;
        });
    }
}

export default Settings;
