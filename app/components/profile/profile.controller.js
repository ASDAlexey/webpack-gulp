class Profile {
    constructor($scope, $state, $modal, $q, Modal, Achievement, Auth, User, Friend, Search, Resource, preloader, Social) {
        this.$scope = $scope;
        this.$state = $state;
        this.$modal = $modal;
        this.$q = $q;
        this.preloader = preloader;
        this.API = User;
        this.Auth = Auth;
        this.Social = Social;
        this.Friend = Friend;
        this.Search = Search;
        this.Achievement = Achievement;
        this.Resource = Resource;

        this.achievements = [];
        this.liked = [];
        this.commented = [];
        this.friends = [];
        this.in = [];
        this.out = [];
        this.other = [];
        this.user = null;
        this.searchQuery = '';
        this.countFriends;
        this.isUserFriend = false;
        this.isSearchState = false;

        this.init();

        var modalOptions = {
            backdrop: true,
            keyboard: true,
            scope: this.$scope,
            windowClass: 'achievement-modal'
        };

        this.achievementModal = new Modal('app.profile.activity', 'app.achievement', modalOptions);

        this.$scope.$on('jellyLikeAchievement', (event, data)=> {
            var achievement = data.response,
                gift = _.find(this.achievements, (gift) => {
                    return gift.id == achievement.id;
                });

            if (gift) gift.likes = achievement.likes;

            if (data.meta.liked) {
                if (!this.isLiked(achievement)) {
                    this.liked.push(achievement.id);
                }
            } else {
                if (this.isLiked(achievement)) {
                    for (var i = this.liked.length - 1; i >= 0; i--) {
                        if (this.liked[i] == achievement.id) {
                            this.liked.splice(i, 1);
                        }
                    }
                }
            }
        });

        this.$scope.$on('friends:updated', (event)=> {
            this.loadListOfFriends(this.userId);
        });

        this.$scope.$on('achievement:load', (event, data)=> {
            var achievement = _.findWhere(this.achievements, {'id': data.id});

            if (achievement) achievement.comments = data.comments;
        });

        this.$scope.$on('achievement:comment:send', (event, data)=> {
            var achievement = _.findWhere(this.achievements, {'id': data});

            if (achievement) {
                achievement.comments += 1;
                this.commented.push(data);
            }
        });

        this.$scope.$watch('profile.searchQuery', (value)=> {
            if (this.isSearchState && !this.searchQuery) {
                this.isSearchState = false;
            }
        });

        this.$scope.$on('auth:login', (event)=> {
            this.init();
        });

        this.$scope.$on('$destroy', ()=> {
            this.achievementModal.destroyModal();
        });
    }

    init() {
        if (this.$state.params.userId) {
            this.userId = parseInt(this.$state.params.userId, 10);

            this.preloader.requestIsSent('main');
            this.$q
                .all([
                    this.loadDataOfProfile(this.userId),
                    this.loadAchievements(this.userId),
                    this.$q.when(this.API.isLogged() ? this.loadListOfFriends(this.userId) : null)
                ]).then((results) => {
                    this.setSEOParameters(results[0], results[1], results[2]);
                }).finally(() => {
                    this.preloader.responseIsReceived('main');
                });
        } else {
            this.$state.go('app.home');
        }
    }

    setSEOParameters(user, achievements, friends) {
        var name = this.API.getUsername(user),
            wallet = _.findWhere(user.wallets, {type: 'JELLY'}),
            points = wallet ? wallet.value : null,
            descriptions = [];

        this.$scope.page.title = `${name} | JellyChip`;

        if (user.information.nickname) descriptions.push(user.information.nickname);
        if (user.information.firstname || user.information.lastname) {
            let fullname = [];

            if (user.information.firstname) fullname.push(user.information.firstname);
            if (user.information.lastname) fullname.push(user.information.lastname);

            descriptions.push(fullname.join(' '));
        }
        if (user.information.country || user.information.state || user.information.city) {
            let location = [];

            if (user.information.country) location.push(user.information.country.name);
            if (user.information.state) location.push(user.information.state.name);
            if (user.information.city) location.push(user.information.city.name);

            descriptions.push(location.join(' '));
        }
        if (angular.isObject(friends) && friends.hasOwnProperty('friends') && friends.friends.length >= 0) descriptions.push(`${this.countFriends} friends`);
        if (points) descriptions.push(`${points} points`);
        if (achievements.length) {
            // get unique gifts and push them to array
            _.each(_.uniq(_.map(achievements, function (achievement) {
                return JSON.stringify(achievement.gift);
            })), function (gift) {
                let obj = JSON.parse(gift);

                if (obj.name) descriptions.push(obj.name);
                if (obj.description) descriptions.push(obj.description);
            });
        }

        this.$scope.page.description = descriptions.join(', ');
    }

    loadDataOfProfile(userId) {
        return this.$q.when(this.Auth.hasPermissionToEdit(userId) ? angular.copy(this.API.getCurrentUser()) : angular.bind(this, getUserProfile, userId)());

        function getUserProfile(userId) {
            return this.API.getUserById(userId).then((data)=> {
                this.user = data.user;
                this.points = data.meta.points;
                this.user.wallets = [
                    {type: "JELLY", value: this.points}
                ];

                return this.user;
            });
        }
    }

    loadAchievements(userId) {
        return this.Achievement.getAchievementsByUserId(userId).then((data)=> {
            this.achievements = data.response.items;
            this.liked = data.meta.liked;
            this.commented = data.meta.commented;

            return this.achievements;
        });
    }

    loadListOfFriends(userId) {
        return this.Friend.getFriendsById(userId).then((list)=> {
            this.friends = list.friends;
            this.in = list.in;
            this.out = list.out;
            this.other = list.other;
            this.countFriends = this.friends.length;

            this.isUserFriend = !!this.Friend.findFriendById(this.API.getCurrentUser().id, this.friends);

            return list;
        });
    }

    hasAchievements() {
        return !!this.achievements.length;
    }

    getTypeGift(gift) {
        var type = '';

        switch (gift.type) {
            case "SQUARE":
                type = '_square';
                break;
            case "TALL":
                type = '_tall';
                break;
            case "WIDE":
                type = '_wide';
                break;
            default:
                type = '_square';
        }

        return type;
    }

    shareTweet(achievement) {
        this.Social.shareAchievementViaTwitter(
            this.$state.href('app.achievement', {achievementId: achievement.id}, {absolute: true}),
            achievement
        );
    }

    shareFb(achievement) {
        this.Social.shareAchievementViaFacebook(this.$state.href('app.achievement', {achievementId: achievement.id}, {absolute: true}), achievement);
    }

    shareEmail(achievement) {
        return this.Social.shareAchievementViaEmail(this.$state.href('app.achievement', {achievementId: achievement.id}, {absolute: true}), achievement);
    }

    getNameOfUser(user) {
        return this.API.getUsername(user);
    }

    search() {
        this.isSearchState = true;

        this.Search.search(this.searchQuery).then((list)=> {
            this.searchFriends = list.friends;
            this.searchIn = list.in;
            this.searchOut = list.out;
            this.searchOther = list.other;

            if (!this.searchFriends.length && !this.searchIn.length && !this.searchOut.length && !this.searchOther.length) {
                this.showInvite(this.searchQuery);
            }
        });
    }

    showInvite(searchQuery) {
        var showInviteCtrl = function showInviteCtrl($modalInstance, query, Friend) {
            this.query = query;
            var reg = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            this.email = reg.test(query) ? query : '';

            this.send = function () {
                Friend.inviteReferral(this.email).then(()=> {
                    $modalInstance.close('close');
                });
            }
        };

        var settings = {
            templateUrl: 'invite-modal.html',
            controller: showInviteCtrl,
            controllerAs: 'modal',
            windowClass: 'invite-modal',
            resolve: {
                query: function () {
                    return searchQuery || '';
                }
            }
        };

        this.$modal.open(settings).result.then(()=> {
            this.isSearchState = false;
            this.loadListOfFriends(this.userId);
        });
    }

    approve(userId) {
        this.Friend.approveByUser(userId).then(()=> {
            this.isSearchState = false;
            this.loadListOfFriends(this.userId);
        });
    }

    reject(userId) {
        this.Friend.rejectByUser(userId).then(()=> {
            this.isSearchState = false;
            this.loadListOfFriends(this.userId);
        });
    }

    approveAfterSearch(user) {
        user.isDecided = true;
        user.decide = 'approve';
        this.Friend.approveByUser(user.id).then(()=> {
            this.loadListOfFriends(this.userId);
        });
    }

    rejectAfterSearch(user) {
        user.isDecided = true;
        user.decide = 'reject';
        this.Friend.rejectByUser(user.id).then(()=> {
            this.loadListOfFriends(this.userId);
        });
    }

    cancel(userId) {
        this.Friend.cancelRequestByUser(userId).then(()=> {
            this.isSearchState = false;
            this.loadListOfFriends(this.userId);
        });
    }

    add(userId) {
        this.Friend.addFriendByUser(userId).then(()=> {
            this.isSearchState = false;
            this.loadListOfFriends(this.userId);
        });
    }

    cancelAfterSearch(userId, groupName, isDelete = true) {
        var item = _.findWhere(this[groupName], {id: userId});
        this.Friend.cancelRequestByUser(userId).then(()=> {
            this.loadListOfFriends(this.userId);
        });
        item.deleted=true;
    }

    addAfterSearch(userId, groupName) {
        this.tempSwitchHighlight(userId, groupName);
    }

    tempSwitchHighlight(userId, groupName, isDetete = false) {
        var item = _.findWhere(this[groupName], {id: userId});
        if (item) {
            item.isAddToTemp = !item.isAddToTemp;
            if (item.isAddToTemp && !isDetete) {
                this.Friend.addFriendByUser(userId).then(()=> {
                    this.loadListOfFriends(this.userId);

                });
            }
            else {
                this.Friend.cancelRequestByUser(userId).then(()=> {
                    this.loadListOfFriends(this.userId);
                });
            }
        }
    }

    remove(user, $event) {
        $event.preventDefault();
        $event.stopPropagation();

        var confirmModalCtrl = function ($modalInstance, userName) {
            this.userName = userName;

            this.yes = function () {
                $modalInstance.close('yes');
            };

            this.no = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var modalInstance = this.$modal.open({
            templateUrl: 'confirm-remove-friend.html',
            windowClass: 'confirm-modal',
            controller: confirmModalCtrl,
            controllerAs: 'modal',
            resolve: {
                userName: ()=> {
                    return this.API.getUsername(user);
                }
            }
        });

        modalInstance.result.then(()=> {
            this.Friend.unfriendUser(user.id).then(()=> {
                this.isSearchState = false;
                this.loadListOfFriends(this.userId);
            });
        });
    }

    removeAfterSearch(user, $event, groupName) {
        $event.preventDefault();
        $event.stopPropagation();

        var confirmModalCtrl = function ($modalInstance, userName) {
            this.userName = userName;

            this.yes = function () {
                $modalInstance.close('yes');
            };

            this.no = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var modalInstance = this.$modal.open({
            templateUrl: 'confirm-remove-friend.html',
            windowClass: 'confirm-modal',
            controller: confirmModalCtrl,
            controllerAs: 'modal',
            resolve: {
                userName: ()=> {
                    return this.API.getUsername(user);
                }
            }
        });

        modalInstance.result.then(()=> {
            var item = _.findWhere(this[groupName], {id: user.id});
            if (item) {
                item.isUnfriend = true;
                this.Friend.unfriendUser(user.id).then(()=> {
                    this.loadListOfFriends(this.userId);
                });
            }

        });
    }

    likeAchievement(achievement) {
        this.Achievement.like(achievement.id);
    }

    isLiked(achievement) {
        return _.contains(this.liked, achievement.id);
    }

    isCommented(achievement) {
        return _.contains(this.commented, achievement.id);
    }
}

export default Profile;
