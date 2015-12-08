class Controller {
    constructor($modalInstance, $q, modalStep, $scope, $rootScope, User, Resource, Social, Friend, Search, logger){
        this.$modalInstance = $modalInstance;
        this.$q = $q;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.User = User;
        this.Social = Social;
        this.Friend = Friend;
        this.Search = Search;
        this.Resource = Resource;
        this.logger = logger;

        this.step = modalStep;
        this.selectedUsers = {};

        if (this.User.isLogged()) {
            var user = angular.copy(this.User.getCurrentUser());

            this.myFirstname = user.information.firstname;
            this.myLastname = user.information.lastname;
            this.userEmail = user.email || '';
        }
    }

    closeModal() {
        this.$modalInstance.close('close');
    }

    openStep(step) {
        this.selectedUsers = {};
        this.selectedAllUser = false;
        this.step = step;
    }

    skipStep(step) {
        switch (step) {
            case 2:
                if (_.size(this.missingUsers)) {
                    this.openStep(3);
                    this.selectUsers(this.missingUsers);
                } else {
                    this.closeModal();
                }
                break;
            default:
                this.closeModal();
                break;
        }
    }

    selectService(service) {
        var handlerName = '',
            user = angular.copy(this.User.getCurrentUser());

        switch (service){
            case 'gmail':
                handlerName = 'getContactsFromGmail';
                break;
            case 'yahoo':
                handlerName = 'getContactsFromYahoo';
                break;
            case 'outlook':
                handlerName = 'getContactsFromOutlook';
                break;
            case 'hotmail':
                handlerName = 'getContactsFromHotmail';
                break;
        }

        if (handlerName) {
            this.formSending = true;
            this.Social[handlerName]()
                .then((contacts)=>{
                    var emails;

                    this.contacts = contacts.filter(function (item) {
                        let reg = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

                        return reg.test(item.email);
                    });

                    emails = _.pluck(this.contacts, 'email');

                    if (angular.isArray(emails) && emails.length) {
                        return this.$q.all([
                            this.Search.searchByListEmails(emails),
                            this.Friend.getFriends()
                        ]).then(([users, friends]) => {
                            var existingUsers = [],
                                missingUsers = [];

                            existingUsers = users.found;
                            missingUsers = _.filter(this.contacts, (value, key)=>{
                                return _.contains(users.absent, value.email);
                            });

                            // remove current logged user
                            delete existingUsers[user.email];

                            // filter contacts which are already friends of current logged user
                            _.each(friends.friends, (friend)=>{
                                if (existingUsers[friend.email]) delete existingUsers[friend.email];
                            });
                            _.each(friends.out, (friend)=>{
                                if (existingUsers[friend.email]) delete existingUsers[friend.email];
                            });

                            this.existingUsers = existingUsers;
                            this.missingUsers = missingUsers;

                            if (_.size(this.existingUsers)) {
                                this.openStep(2);
                                this.selectUsers(this.existingUsers);
                            } else if (_.size(this.missingUsers)) {
                                this.openStep(3);
                                this.selectUsers(this.missingUsers);
                            } else {
                                this.logger.success('Your list of contacts is empty.');
                            }

                            return users;
                        });
                    } else {
                        this.logger.success('Your list of contacts is empty.');

                        return this.contacts;
                    }
                })
                .finally(()=>{
                    this.formSending = false;
                });
        }
    }

    addFriends() {
        var idsSelectedUsers = _.pluck(this.getSelectedUsers(), 'id');

        if (!idsSelectedUsers.length) return;

        this.formSending = true;
        this.Friend.addFriends(idsSelectedUsers).then((response)=>{
            this.$rootScope.$broadcast('friends:updated');

            if (_.size(this.missingUsers)) {
                this.openStep(3);
                this.selectUsers(this.missingUsers);
            } else {
                this.closeModal();
            }
        }).finally(()=>{
            this.formSending = false;
        });
    }

    selectUsers(users) {
        this.selectedAllUser = true;
        this.changeAllUsers(users);
    }

    changeAllUsers(users) {
        _.each(users, (value, key)=>{
            this.selectedUsers[key] = this.selectedAllUser ? value : null;
        });
    }

    changeSelectedUsers(users) {
        this.selectedAllUser = _.size(this.getSelectedUsers()) === _.size(users);
    }

    getSelectedUsers() {
        return _.filter(this.selectedUsers, (value)=>{ return angular.isObject(value); });
    }

    selectUser(key, user) {
        this.selectedUsers[key] = this.selectedUsers[key] ? null : user;
    }

    rebuildListUsersScrollbar() {
        this.$scope.$broadcast('scrollbar:rebuild:inviteListUsers');
    }

    // selectFriends() {
    //     if (!this.userEmail) return;

    //     this.formSending = true;
    //     this.Social.getContactsFromYahoo(this.userEmail).then((contacts)=>{
    //         this.contacts = contacts;

    //         if (this.contacts.length) {
    //             // var emails = _.pluck(this.contacts, 'email');

    //             // return this.Search.searchByListEmails(emails).then((existingUsers)=>{
    //             //     this.existingUsers = existingUsers;

    //             //     this.step = this.existingUsers.length ? 2 : 3;

    //             //     return this.existingUsers;
    //             // });

    //             this.existingUsers = this.contacts;
    //             this.step = 2;
    //         } else {
    //             this.closeModal();
    //         }
    //     }).finally(()=>{
    //         this.formSending = false;
    //     });
    // }

    inviteFriends() {
        var selectedUsers = _.pluck(this.getSelectedUsers(), 'email');

        if (!selectedUsers.length) return;

        this.formSending = true;
        this.Friend.inviteUsers(selectedUsers, this.myFirstname, this.myLastname).then((response)=>{
            this.openStep(4);
        }).finally(()=>{
            this.formSending = false;
        });
    }

    invite() {
        if (!this.friendEmail) return;

        this.formSending = true;
        this.Friend.inviteReferral(this.friendEmail).then(()=>{
            this.openStep(4);
        }).finally(()=>{
            this.formSending = false;
        });
    }
}

export default Controller;
